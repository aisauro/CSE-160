// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    //gl_PointSize = 10.0;
    gl_PointSize = u_Size;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

//Global Variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;

function setupWebGL(){
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl160');

  // Get the rendering context for WebGL
  //gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true})
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

}

function connectVariablesToGLSL(){
  // Initialize shader
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position')
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_Size
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }
}

// Costants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Globals related UI elements
let g_selectedColor=[1.0,1.0,1.0,1.0];
let g_selectedSize=5;
let g_selectedType=POINT;
let g_selectedSegments = 10;

// Set up actions for the HTML UI elements
function addActionsForHtmlUI(){

  // Button Events
  //document.getElementById('green').onclick = function() { g_selectedColor = [0.0,1.0,0.0,1.0]; };
  //document.getElementById('red').onclick = function() { g_selectedColor = [1.0,0.0,0.0,1.0]; };
  document.getElementById('clearButton').onclick = function() { g_shapesList=[]; renderAllShapes();};

  document.getElementById('pointButton').onclick = function() { g_selectedType=POINT};
  document.getElementById('triButton').onclick = function() { g_selectedType=TRIANGLE };
  document.getElementById('circleButton').onclick = function() { g_selectedType=CIRCLE};

  // Color Slider Events
  document.getElementById('redSlide').addEventListener('mouseup', function() { g_selectedColor[0] = this.value/100; });
  document.getElementById('greenSlide').addEventListener('mouseup', function() { g_selectedColor[1] = this.value/100; });
  document.getElementById('blueSlide').addEventListener('mouseup', function() { g_selectedColor[2] = this.value/100; });

  // Size Slider Events
  document.getElementById('sizeSlide').addEventListener('mouseup', function() { g_selectedSize = this.value; });
  document.getElementById('segSlide').addEventListener('mouseup', function() { g_selectedSegments = this.value; }); 
}

function main() {

  // Set up canvas and gl variables
  setupWebGL();
  // Set up GLSL shader programs and connect GLSL variables
  connectVariablesToGLSL();

  // Set up actions for the HTML UI elemtns
  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;//function(ev){ click(ev, gl, canvas, a_Position); };
  canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) } };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_shapesList = [];
/*
var g_points = [];  // The array for the position of a mouse press
var g_colors = [];  // The array to store the color of a point
var g_sizes = [];
*/
function click(ev) {
  
  // Extract the event click and return it in WebGL coordinates
  [x, y] = convertCoordinatesEventToGL(ev);
  
  // Create and store the new point
  let point;
  let circle;
  if (g_selectedType==POINT){
    point = new Point();
    point.position=[x,y];
    point.color=g_selectedColor.slice();
    point.size=g_selectedSize;
    g_shapesList.push(point);
  } else if (g_selectedType==TRIANGLE){
    point = new Triangle();
    point.position=[x,y];
    point.color=g_selectedColor.slice();
    point.size=g_selectedSize;
    g_shapesList.push(point);
  } else {
    //point = new Circle();
    circle = new Circle();
    circle.position = [x, y];
    circle.color = g_selectedColor.slice();
    circle.size = g_selectedSize;
    circle.segments = g_selectedSegments; // pass current segment count
    g_shapesList.push(circle);
  }
  /*point.position=[x,y];
  point.color=g_selectedColor.slice();
  point.size=g_selectedSize;
  g_shapesList.push(point);*/
  
  /*
  // Store the coordinates to g_points array
  g_points.push([x, y]);

  // Store the coordinates to g_points array
  g_colors.push(g_selectedColor.slice());
  
  // Store the seize to the g_sizes array
  g_sizes.push(g_selectedSize);
  */
  /*
  if (x >= 0.0 && y >= 0.0) {      // First quadrant
    g_colors.push([1.0, 0.0, 0.0, 1.0]);  // Red
  } else if (x < 0.0 && y < 0.0) { // Third quadrant
    g_colors.push([0.0, 1.0, 0.0, 1.0]);  // Green
  } else {                         // Others
    g_colors.push([1.0, 1.0, 1.0, 1.0]);  // White
  }
  */
  //Draw every shape that is supposed to be in the canvas
  renderAllShapes();
}

// Extract the event click and return it in WebGL coordinates
function convertCoordinatesEventToGL(ev){
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return ([x, y]);
}

//Draw every shape that is supposed to be in the canvas
function renderAllShapes(){
  
  // Check the time at the start of this function
  var startTime = performance.now();
  
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Draw each shape in the list
  var len = g_shapesList.length;
  for(var i = 0; i < len; i++) {
    g_shapesList[i].render();
  }

  // Check the time at the end of the function, and show on web page
  var duration = performance.now() - startTime;
  sendTextToHTML("numdot: " + len + " ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");

}

// Set the text of a HTML element
function sendTextToHTML(text, htmlID){
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}

function drawMyTrianglePicture() {
  // Clear the canvas first if needed
  g_shapesList = []; // optional, if you want to clear old shapes
  gl.clear(gl.COLOR_BUFFER_BIT);
  let d = 25.0;
  let cX = 0;
  let cY = 15;
  /*
  // Example triangle: [x1, y1, x2, y2, x3, y3]
  // Use color and drawTriangle() to add each triangle
  // Repeat this for every triangle in your hand-drawn scene

  // Triangle 1
  gl.uniform4f(u_FragColor, 1.0, 0.0, 0.0, 1.0); // red
  drawTriangle([-0.5, 0.0, -0.3, 0.5, -0.1, 0.0]);

  // Triangle 2
  gl.uniform4f(u_FragColor, 0.0, 1.0, 0.0, 1.0); // green
  drawTriangle([0.1, 0.0, 0.3, 0.5, 0.5, 0.0]);

  // ... add the rest of your triangles here
  */
  // body
  gl.uniform4f(u_FragColor, 1.0, 1.0, 1.0, 1.0); // white
  //drawTriangle([0.1, 0.0, 0.3, 0.5, 0.5, 0.0]);
  //drawTriangle([-12/d, 0/d, 12/d, 0/d, 0/d, 32/d]);
  drawTriangle([-12/d, (0-cY)/d, 12/d, (0-cY)/d, cX/d, (32-cY)/d]);
  drawTriangle([-12/d, (0-cY)/d, cX/d, (-6-cY)/d, 12/d, (0-cY)/d]);
  //RIGHT
  drawTriangle([3/d, (-4-cY)/d, 5/d, (-6-cY)/d, 12/d, (0-cY)/d]);
  drawTriangle([12/d, (0-cY)/d, 5/d, (-6-cY)/d, 8/d, (-6-cY)/d]);
  drawTriangle([12/d, (0-cY)/d, 8/d, (-6-cY)/d, 10/d, (-4-cY)/d]);
  //LEFT
  drawTriangle([-3/d, (-4-cY)/d, -5/d, (-6-cY)/d, -12/d, (0-cY)/d]);
  drawTriangle([-12/d, (0-cY)/d, -5/d, (-6-cY)/d, -8/d, (-6-cY)/d]);
  drawTriangle([-12/d, (0-cY)/d, -8/d, (-6-cY)/d, -10/d, (-4-cY)/d]);
  
  // head
  // RIGHT
  drawTriangle([0/d, (32-cY)/d, 7/d, (13-cY)/d, 5/d, (27-cY)/d]);
  drawTriangle([0/d, (32-cY)/d, 5/d, (27-cY)/d, 3/d, (31-cY)/d]);
  // LEFT
  drawTriangle([0/d, (32-cY)/d, -7/d, (13-cY)/d, -5/d, (27-cY)/d]);
  drawTriangle([0/d, (32-cY)/d, -5/d, (27-cY)/d, -3/d, (31-cY)/d]);

  //feet
  // RIGHT
  gl.uniform4f(u_FragColor, 1.0, 1.0, 0.0, 1.0); // yellow
  drawTriangle([3/d, (-4-cY)/d, 2/d, (-8-cY)/d, 5/d, (-6-cY)/d]);
  drawTriangle([5/d, (-6-cY)/d, 7/d, (-9-cY)/d, 8/d, (-6-cY)/d]);
  drawTriangle([8/d, (-6-cY)/d, 12/d, (-7-cY)/d, 10/d, (-4-cY)/d]);
  drawTriangle([3/d, (-4-cY)/d, 5/d, (-6-cY)/d, 5/d, (-3-cY)/d]);
  drawTriangle([5/d, (-3-cY)/d, 5/d, (-6-cY)/d, 8/d, (-3-cY)/d]);
  drawTriangle([8/d, (-3-cY)/d, 5/d, (-6-cY)/d, 8/d, (-6-cY)/d]);
  drawTriangle([8/d, (-3-cY)/d, 8/d, (-6-cY)/d, 10/d, (-4-cY)/d]);
  // LEFT
  drawTriangle([-3/d, (-4-cY)/d, -2/d, (-8-cY)/d, -5/d, (-6-cY)/d]);
  drawTriangle([-5/d, (-6-cY)/d, -7/d, (-9-cY)/d, -8/d, (-6-cY)/d]);
  drawTriangle([-8/d, (-6-cY)/d, -12/d, (-7-cY)/d, -10/d, (-4-cY)/d]);
  drawTriangle([-3/d, (-4-cY)/d, -5/d, (-6-cY)/d, -5/d, (-3-cY)/d]);
  drawTriangle([-5/d, (-3-cY)/d, -5/d, (-6-cY)/d, -8/d, (-3-cY)/d]);
  drawTriangle([-8/d, (-3-cY)/d, -5/d, (-6-cY)/d, -8/d, (-6-cY)/d]);
  drawTriangle([-8/d, (-3-cY)/d, -8/d, (-6-cY)/d, -10/d, (-4-cY)/d]);

  // wing
  // RIGHT
  gl.uniform4f(u_FragColor, 0.59, 0.29, 0.0, 1.0); // brown
  drawTriangle([7/d, (13-cY)/d, 9/d, (5-cY)/d, 12/d, (0-cY)/d]);
  drawTriangle([7/d, (13-cY)/d, 12/d, (0-cY)/d, 12/d, (14-cY)/d]);
  drawTriangle([12/d, (14-cY)/d, 12/d, (0-cY)/d, 16/d, (3-cY)/d]);
  drawTriangle([12/d, (14-cY)/d, 16/d, (3-cY)/d, 16/d, (8-cY)/d]);
  // LEFT
  drawTriangle([-7/d, (13-cY)/d, -9/d, (5-cY)/d, -12/d, (0-cY)/d]);
  drawTriangle([-7/d, (13-cY)/d, -12/d, (0-cY)/d, -12/d, (14-cY)/d]);
  drawTriangle([-12/d, (14-cY)/d, -12/d, (0-cY)/d, -16/d, (3-cY)/d]);
  drawTriangle([-12/d, (14-cY)/d, -16/d, (3-cY)/d, -16/d, (8-cY)/d]);
  
  // face
  // RIGHT
  drawTriangle([0/d, (27-cY)/d, 0/d, (21-cY)/d, 4/d, (28-cY)/d]);
  drawTriangle([4/d, (28-cY)/d, 3/d, (27-cY)/d, 5/d, (27-cY)/d]);
  drawTriangle([4/d, (28-cY)/d, 0/d, (21-cY)/d, 3/d, (22-cY)/d]);
  drawTriangle([4/d, (23-cY)/d, 5/d, (23-cY)/d, 5.5/d, (24.5-cY)/d]);
  drawTriangle([4/d, (28-cY)/d, 3/d, (22-cY)/d, 5.5/d, (24.5-cY)/d]);
  drawTriangle([4/d, (28-cY)/d, 5.5/d, (24.5-cY)/d, 5/d, (27-cY)/d]);
  // LEFT
  drawTriangle([-0/d, (27-cY)/d, -0/d, (21-cY)/d, -4/d, (28-cY)/d]);
  drawTriangle([-4/d, (28-cY)/d, -3/d, (27-cY)/d, -5/d, (27-cY)/d]);
  drawTriangle([-4/d, (28-cY)/d, -0/d, (21-cY)/d, -3/d, (22-cY)/d]);
  drawTriangle([-4/d, (23-cY)/d, -5/d, (23-cY)/d, -5.5/d, (24.5-cY)/d]);
  drawTriangle([-4/d, (28-cY)/d, -3/d, (22-cY)/d, -5.5/d, (24.5-cY)/d]);
  drawTriangle([-4/d, (28-cY)/d, -5.5/d, (24.5-cY)/d, -5/d, (27-cY)/d]);

  // chin flaps
  gl.uniform4f(u_FragColor, 1.0, 0.0, 0.0, 1.0); // red
  // RIGHT
  drawTriangle([1/d, (22-cY)/d, 1/d, (16-cY)/d, 2/d, (15-cY)/d]);
  drawTriangle([1/d, (22-cY)/d, 2/d, (15-cY)/d, 3/d, (17-cY)/d]);
  drawTriangle([1/d, (22-cY)/d, 3/d, (17-cY)/d, 2/d, (22-cY)/d]);
  // LEFT
  drawTriangle([-1/d, (22-cY)/d, -1/d, (16-cY)/d, -2/d, (15-cY)/d]);
  drawTriangle([-1/d, (22-cY)/d, -2/d, (15-cY)/d, -3/d, (17-cY)/d]);
  drawTriangle([-1/d, (22-cY)/d, -3/d, (17-cY)/d, -2/d, (22-cY)/d]);

  // head flaps
  drawTriangle([0/d, (35-cY)/d, 0/d, (31-cY)/d, 1/d, (32-cY)/d]);
  drawTriangle([2/d, (33-cY)/d, 0/d, (31-cY)/d, 0/d, (27-cY)/d]);

  // beak
  gl.uniform4f(u_FragColor, 1.0, 0.65, 0.0, 1.0); // orange
  drawTriangle([0/d, (25-cY)/d, -2/d, (24-cY)/d, 2/d, (24-cY)/d]);
  drawTriangle([0/d, (23-cY)/d, 2/d, (24-cY)/d, -2/d, (24-cY)/d]);

  // eyes
  gl.uniform4f(u_FragColor, 0.0, 0.0, 0.0, 1.0); // black
  // RIGHT
  drawTriangle([4/d, (27-cY)/d, 3/d, (26-cY)/d, 4.5/d, (26-cY)/d]);
  drawTriangle([4/d, (25-cY)/d, 4.5/d, (26-cY)/d, 3/d, (26-cY)/d]);
  // LEFT
  drawTriangle([-4/d, (27-cY)/d, -3/d, (26-cY)/d, -4.5/d, (26-cY)/d]);
  drawTriangle([-4/d, (25-cY)/d, -4.5/d, (26-cY)/d, -3/d, (26-cY)/d]);
}