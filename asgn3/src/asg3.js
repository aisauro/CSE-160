// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform int u_whichTexture;
  uniform float u_texColorWeight; // t in blending formula
  void main() {
    if (u_whichTexture == -2) {
      gl_FragColor = u_FragColor;                  // Use color

    } else if (u_whichTexture == -1) {             // Use UV debug color
      gl_FragColor = vec4(v_UV,1.0,1.0);

    } else if (u_whichTexture == 0) {              // Use texture0
      gl_FragColor = texture2D(u_Sampler0, v_UV);

    } else if (u_whichTexture == -3) {  // linear interpolation
      vec4 baseColor = u_FragColor;
      vec4 texColor = texture2D(u_Sampler0, v_UV);
      float t = u_texColorWeight;
      gl_FragColor = (1.0 - t) * baseColor + t * texColor;
    } else if (u_whichTexture == 1) {
      gl_FragColor = texture2D(u_Sampler1, v_UV);
    } else {                                       // Error, put Redish
      gl_FragColor = vec4(1,.2,.2,1);
    }
  }`

//Global Variables
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_Sampler0;
let u_Sampler1;
let u_whichTexture;
let u_texColorWeight;

function setupWebGL(){
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  //gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL(){
  // Initialize shader
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // // Get the storage location of a_UV
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }

  // Get the storage location of u_whichTexture
  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get the storage location of u_whichTexture');
    return;
  }


  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  // Get the storage location of u_GlobalRotateMatrix
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  // Get the storage location of u_ViewMatrix
  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }
  
  // Get the storage location of u_ProjectionMatrix
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }
  
  // Get the storage location of u_Sampler0
  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler0');
    return;
  }

  // Get the storage location of u_Sampler1
  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler1');
    return;
  }

  // Set an initial value for this matrix to identity
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

}

// Costants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Globals related UI elements
let g_selectedColor=[1.0,1.0,1.0,1.0];
let g_selectedSize=5;
let g_selectedType=POINT;
//let g_globalXAngle=0;
//let g_globalYAngle=0;
//let g_globalZAngle=0;
let g_globalAngle=0;
let g_yellowAngle=0;
let g_magentaAngle=0;
let g_yellowAnimation=false;
let g_magentaAnimation=false;
let g_camera;

// Set up actions for the HTML UI elements
function addActionsForHtmlUI(){

  // Button Events
  // document.getElementById('clearButton').onclick = function() { g_shapesList=[]; renderAllShapes();};
  document.getElementById('animationYellowOffButton').onclick = function() {g_yellowAnimation=false;};
  document.getElementById('animationYellowOnButton').onclick = function() {g_yellowAnimation=true;};
  document.getElementById('animationMagentaOffButton').onclick = function() {g_magentaAnimation=false;};
  document.getElementById('animationMagentaOnButton').onclick = function() {g_magentaAnimation=true;};
  //document.getElementById('swordAnimationOffButton').onclick = function() {g_swordAnimation=false;};
  //document.getElementById('swordAnimationOnButton').onclick = function() {g_swordAnimation=true;};

  // document.getElementById('pointButton').onclick = function() { g_selectedType=POINT};
  // document.getElementById('triButton').onclick = function() { g_selectedType=TRIANGLE };
  // document.getElementById('circleButton').onclick = function() { g_selectedType=CIRCLE};
  // MOUSE ROTATE CLICK AND DRAG
  canvas.addEventListener('mousedown', (event) => g_camera.onMouseDown(event));
  canvas.addEventListener('mousemove', (event) => g_camera.onMouseMove(event));
  canvas.addEventListener('mouseup', () => g_camera.onMouseUp());
  // Color Slider Events
  // document.getElementById('redSlide').addEventListener('mouseup', function() { g_selectedColor[0] = this.value/100; });
  // document.getElementById('greenSlide').addEventListener('mouseup', function() { g_selectedColor[1] = this.value/100; });
  // document.getElementById('blueSlide').addEventListener('mouseup', function() { g_selectedColor[2] = this.value/100; });
  document.getElementById('yellowSlide').addEventListener('mousemove', function() { g_yellowAngle = this.value; renderAllShapes();});
  document.getElementById('magentaSlide').addEventListener('mousemove', function() { g_magentaAngle = this.value; renderAllShapes();});
  //document.getElementById('neckSlide').addEventListener('mousemove', function() { g_neckAngle = this.value; renderAllShapes();});
  //document.getElementById('headSlide').addEventListener('mousemove', function() { g_headYawAngle = this.value; renderAllShapes();});
  // Correcting the right and left wing sliders
  //document.getElementById('leftWingSlide').addEventListener('mousemove', function() { g_leftWingAngle = this.value; renderAllShapes(); });
  //document.getElementById('rightWingSlide').addEventListener('mousemove', function() { g_rightWingAngle = this.value; renderAllShapes(); });
  // Correcting the left and right leg sliders
  //document.getElementById('leftLegSlide').addEventListener('mousemove', function() { g_leftLegAngle = this.value; renderAllShapes(); });
  //document.getElementById('rightLegSlide').addEventListener('mousemove', function() { g_rightLegAngle = this.value; renderAllShapes(); });
  //document.getElementById('leftKneeSlide').addEventListener('mousemove', function() { g_leftKneeAngle = this.value; renderAllShapes(); });
  //document.getElementById('rightKneeSlide').addEventListener('mousemove', function() { g_rightKneeAngle = this.value; renderAllShapes(); });


  // Size Slider Events
  document.getElementById('angleSlide').addEventListener('mousemove', function() { g_globalAngle = this.value; renderAllShapes(); });
}

function initTextures() {
  // Get the storage location of u_texColorWeight
  u_texColorWeight = gl.getUniformLocation(gl.program, 'u_texColorWeight');
  if (!u_texColorWeight) {
    console.log('Failed to get the storage location of u_texColorWeight');
    return;
  }
  //
  var image1 = new Image();  // Create the image object
  if (!image1) {
    console.log('Failed to create the image object');
    return false;
  }
  var image2 = new Image();  // Create the image object
  if (!image2) {
    console.log('Failed to create the image object');
    return false;
  }
  // Register the event handler to be called on loading an image
  image1.onload = function(){ sendImageToTEXTURE0( image1); };
  // Tell the browser to load an image
  image1.src = 'sky.jpg';

  // Add more texture loading
  image2.onload = function() { sendImageToTEXTURE1( image2); };
  image2.src = 'grass2.png'

  return true;
}

function sendImageToTEXTURE0(image) {
  var texture = gl.createTexture();   // Create a texture object
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE0);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler0, 0);
  
  //gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>

  //gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle
  console.log('finished loadTexture');
}

function sendImageToTEXTURE1(image) {
  var texture = gl.createTexture();   // Create a texture object
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE1);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 1 to the sampler
  gl.uniform1i(u_Sampler1, 1);
  
  //gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>

  //gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle
  console.log('finished loadTexture');
}

function main() {

  // Set up canvas and gl variables
  setupWebGL();
  // Set up GLSL shader programs and connect GLSL variables
  connectVariablesToGLSL();

  // Set up actions for the HTML UI elemtns
  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  //canvas.onmousedown = click;//function(ev){ click(ev, gl, canvas, a_Position); };
  //canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) } };
  g_camera = new Camera(canvas);
  //document.onkeydown = keydown;
  document.onkeydown = function(ev) { keydown(ev) };
  //document.addEventListener('keydown', keydown, false);
  
  initTextures();

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  //gl.clear(gl.COLOR_BUFFER_BIT);
  //renderAllShapes();
  requestAnimationFrame(tick);
}

var g_startTime=performance.now()/1000.0;
var g_seconds=performance.now()/1000.0-g_startTime;

// Called by browser repeatedly whenever its time
function tick(){
  // Save the current time
  g_seconds=performance.now()/1000.0-g_startTime;
  //console.log(g_seconds);
  // Update Animation Angles
  updateAnimationAngles();
  // Draw everything
  renderAllShapes();
  // Tell the browser to update again when it has time
  requestAnimationFrame(tick);
}

// Update the angles of everything if currently animated
function updateAnimationAngles() {
  if (g_yellowAnimation) {
    g_yellowAngle = (45*Math.sin(g_seconds));
  }
  if (g_magentaAnimation) {
    g_magentaAngle = (45*Math.sin(3*g_seconds));
  }
}

function keydown(ev) {
  const speed = 0.1;     // movement speed
  const angle = 5;       // panning angle in degrees

  switch (ev.keyCode) {
    case 87: // W
      g_camera.moveForward(speed);
      break;
    case 83: // S
      g_camera.moveBackwards(speed);
      break;
    case 65: // A
      g_camera.moveLeft(speed);
      break;
    case 68: // D
      g_camera.moveRight(speed);
      break;
    case 81: // Q
      g_camera.panLeft(angle);
      break;
    case 69: // E
      g_camera.panRight(angle);
      break;
    default:
      return; // don't redraw if nothing happens
  }
  
  renderAllShapes(); // re-render the scene
}

//Draw every shape that is supposed to be in the canvas
function renderAllShapes(){
  
  // Check the time at the start of this function
  var startTime = performance.now();
  
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, g_camera.projectionMatrix.elements);
  gl.uniformMatrix4fv(u_ViewMatrix, false, g_camera.viewMatrix.elements);

  // Pass the matrix to u_ModelMatrix attribute
  var globalRotMat=new Matrix4().rotate(g_globalAngle,0,1,0);
  //globalRotMat.rotate(-g_globalXAngle,1,0,0);
  //globalRotMat.rotate(g_globalYAngle,0,1,0);
  //globalRotMat.rotate(g_globalZAngle,0,0,1);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
  
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT );

  // Draw the floor
  var floor = new Cube();
  floor.color = [1.0,0.0,0.0,1.0];
  floor.textureNum=1;
  floor.matrix.translate(0, -.75, 0.0);
  floor.matrix.scale(100, 0.01, 100);
  floor.matrix.rotate(320,1,0,0);
  //floor.matrix.translate(-.5, 0, 0.5);
  floor.render();

  // Draw the sky
  var sky = new Cube();
  sky.color = [0.0,0.0,1.0,1.0];
  sky.textureNum=-2;
  sky.matrix.scale(500,500,500);
  sky.matrix.translate(-.5, -.5, -0.5);
  sky.render();
  // Check the time at the end of the function, and show on web page
  var duration = performance.now() - startTime;
  sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");
  //sendTextToHTML("numdot: " + len + " ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");

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
