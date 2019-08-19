var VSHADER_SOURCE =
  'attribute vec4 aPosition;\n' +
  'attribute vec4 vColor;\n' +

  'varying vec4 fColor;\n' +
  'void main() {\n' +
  ' gl_Position = aPosition;\n' +
  ' gl_PointSize = 10.0;\n' +

  ' fColor = vColor;\n' +
  '}\n';

var FSHADER_SOURCE =
  'precision mediump float;\n' +

  'varying vec4 fColor;\n' +
  'void main(){\n'+
  ' gl_FragColor = fColor;\n'+
  '}\n';

function main(){
  var canvas = document.getElementById('webgl');
  var gl = getWebGLContext(canvas);

  if(!gl){
    console.log('Failed to get the WebGL context');
    return;
  }

  if(!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)){
    console.log('Failed to initialize shaders');
    return;
  }

  canvas.onmousedown = function(ev){ click(ev, gl, canvas); };
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
}

function initVertexBuffers(gl){
  var vertices = new Float32Array([0,0.5, -0.5,-0.5, 0.5,-0.5, 0.5,0.5]);
  var n = 2;
  var vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  var aPosition = gl.getAttribLocation(gl.program, 'aPosition');
  if(aPosition < 0){
    console.log('Failed to get location of aPosition');
    return;
  }
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aPosition);

  return n;
}

function example2VertexBuffers(gl){
  var vertices = new Float32Array([0,0,0,  1,0,15]);
  var n = 2;
  var vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  var aPosition = gl.getAttribLocation(gl.program, 'aPosition');
  if(aPosition < 0){
    console.log('Failed to get location of aPosition');
    return;
  }
  gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aPosition);

  return n;
}

var g_points = [];
var g_colors = [];
var clicks = {Value: 0};

var r = 0.0;
var g = 0.0;
var b = 0.0;

function click(ev, gl, canvas) {
  clicks.Value += 1;

  var x = ev.clientX;
  var y = ev.clientY;
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  g_points.push(x);
  g_points.push(y);

  // AFTER 3 clicks changes the color
  if(((clicks.Value - 1) % 3) == 0){
    r = Math.random();
    g = Math.random();
    b = Math.random();
  }

  // add a color to g_colors
  g_colors.push(r);
  g_colors.push(g);
  g_colors.push(b);
  g_colors.push(1.0);

  gl.clear(gl.COLOR_BUFFER_BIT);

  // prepare buffer for positions
  var vertices = new Float32Array(g_points);
  var vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer); // create bridge to memory
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW); // fill memory

  // *** take this and put it
  var aPosition = gl.getAttribLocation(gl.program, 'aPosition');
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0); // binds the filled buffer to an attribute
  gl.enableVertexAttribArray(aPosition);
  // ***

  // prepare buffer for colors
  var colors = new Float32Array(g_colors);
  var cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, colors, gl.DYNAMIC_DRAW);

  var vColor = gl.getAttribLocation(gl.program, "vColor");
  gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vColor);

  // *** here: positions go wrong
  var n = g_points.length/2;

  // render shaders
  gl.drawArrays(gl.TRIANGLES, 0, n);
}

// notes:
// u have to create a buffer for colors and vertices.
// the number of color attributes has to be equal to the number of vertex attributes.
// every color is asociated to a set of vertex coordinates
// therefore: each triangle needs 3 colors, the same but 3
// every 3 clicks, u change the color
