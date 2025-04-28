// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
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
let u_ModelMatrix;
let u_GlobalRotateMatrix;

function setupWebGL(){
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  //gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true})
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

  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  // Get the storage location of u_GlobalRotateMatrix
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_u_GlobalRotateYMatrix');
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
let g_globalXAngle=0;
let g_globalYAngle=0;
let g_globalZAngle=0;
//let g_yellowAngle=0;
let g_swordAngle = 0;
let g_neckAngle       =  0;   // tilt neck forward/back
let g_headYawAngle    =  0;   // turn head side-to-side
let g_leftWingAngle   =  45;   // flap left wing
let g_rightWingAngle  =  -45;   // flap right wing
let g_leftLegAngle    =  0;   // swing left leg
let g_leftKneeAngle   =  0;   // bend left knee
let g_rightLegAngle   =  0;   // swing right leg
let g_rightKneeAngle  =  0;   // bend right knee
//let g_swordAnimation = false;
let g_wingAnimation=false;
let g_peckAnimation=false;


// Set up actions for the HTML UI elements
function addActionsForHtmlUI(){

  // Button Events
  // document.getElementById('clearButton').onclick = function() { g_shapesList=[]; renderAllShapes();};
  document.getElementById('animationWingOffButton').onclick = function() {g_wingAnimation=false;};
  document.getElementById('animationWingOnButton').onclick = function() {g_wingAnimation=true;};
  document.getElementById('animationPeckOffButton').onclick = function() {g_peckAnimation=false;};
  document.getElementById('animationPeckOnButton').onclick = function() {g_peckAnimation=true;};
  //document.getElementById('swordAnimationOffButton').onclick = function() {g_swordAnimation=false;};
  //document.getElementById('swordAnimationOnButton').onclick = function() {g_swordAnimation=true;};

  // document.getElementById('pointButton').onclick = function() { g_selectedType=POINT};
  // document.getElementById('triButton').onclick = function() { g_selectedType=TRIANGLE };
  // document.getElementById('circleButton').onclick = function() { g_selectedType=CIRCLE};

  // Color Slider Events
  // document.getElementById('redSlide').addEventListener('mouseup', function() { g_selectedColor[0] = this.value/100; });
  // document.getElementById('greenSlide').addEventListener('mouseup', function() { g_selectedColor[1] = this.value/100; });
  // document.getElementById('blueSlide').addEventListener('mouseup', function() { g_selectedColor[2] = this.value/100; });
  //document.getElementById('yellowSlide').addEventListener('mousemove', function() { g_yellowAngle = this.value; renderAllShapes();});
  document.getElementById('neckSlide').addEventListener('mousemove', function() { g_neckAngle = this.value; renderAllShapes();});
  document.getElementById('headSlide').addEventListener('mousemove', function() { g_headYawAngle = this.value; renderAllShapes();});
  // Correcting the right and left wing sliders
  document.getElementById('leftWingSlide').addEventListener('mousemove', function() { g_leftWingAngle = this.value; renderAllShapes(); });
  document.getElementById('rightWingSlide').addEventListener('mousemove', function() { g_rightWingAngle = this.value; renderAllShapes(); });
  // Correcting the left and right leg sliders
  document.getElementById('leftLegSlide').addEventListener('mousemove', function() { g_leftLegAngle = this.value; renderAllShapes(); });
  document.getElementById('rightLegSlide').addEventListener('mousemove', function() { g_rightLegAngle = this.value; renderAllShapes(); });
  document.getElementById('leftKneeSlide').addEventListener('mousemove', function() { g_leftKneeAngle = this.value; renderAllShapes(); });
  document.getElementById('rightKneeSlide').addEventListener('mousemove', function() { g_rightKneeAngle = this.value; renderAllShapes(); });


  // Size Slider Events
  //document.getElementById('angleSlide').addEventListener('mouseup', function() { g_globalAngle = this.value; renderAllShapes(); });
  document.getElementById('angleXSlide').addEventListener('mousemove', function() { g_globalXAngle = this.value; renderAllShapes(); });
  document.getElementById('angleYSlide').addEventListener('mousemove', function() { g_globalYAngle = this.value; renderAllShapes(); });
  document.getElementById('angleZSlide').addEventListener('mousemove', function() { g_globalZAngle = this.value; renderAllShapes(); });
  document.getElementById('swordSlide').addEventListener('mousemove', function() { g_swordAngle = this.value; renderAllShapes(); });
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
  if (g_wingAnimation) {
    g_leftWingAngle = (35*Math.sin(g_seconds));
    g_rightWingAngle = (-35*Math.sin(g_seconds));
  }
  if (g_peckAnimation) {
    g_neckAngle = (20*Math.sin(3*g_seconds)) - 20;
    g_headYawAngle = (2*Math.sin(3*g_seconds));
    g_swordAngle = (15*Math.sin(3*g_seconds));
  }
  /*if (g_swordAnimation) {
    g_swordAngle = 30*Math.sin(2*g_seconds);
  }*/
}

//Draw every shape that is supposed to be in the canvas
function renderAllShapes(){
  
  // Check the time at the start of this function
  var startTime = performance.now();
  
  // Pass the matrix to u_ModelMatrix attribute
  var globalRotMat=new Matrix4()
  globalRotMat.rotate(-g_globalXAngle,1,0,0);
  globalRotMat.rotate(g_globalYAngle,0,1,0);
  globalRotMat.rotate(g_globalZAngle,0,0,1);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT );

  // 1) BODY (root of hierarchy)
  let body = new Cube();
  body.color = [1.0, 1.0, 0.8, 1.0];        // pale yellow
  body.matrix = new Matrix4(globalRotMat)
    .translate(-0.2, -0.3, 0)                  // center position
    .scale(0.4, 0.5, 0.4);                 // body size
  body.render();

  // 2) NECK (child of body)
  let neck = new Cube();
  neck.color = [1.0, 1.0, 1.0, 1.0];        // bright yellow
  neck.matrix = new Matrix4(body.matrix)
    .translate(0.25, .3, 0.25)                // attach to top of body
    .rotate(g_neckAngle, 0.9, 0, 0)          // neck tilt animation
    .scale(0.5, 1, 0.5);                 // neck size
  neck.render();

  // 3) HEAD (child of neck)
  let head = new Cube();
  head.color = [1.0, 0.8, 0.0, 1.0];        // orange yellow
  head.matrix = new Matrix4(neck.matrix)
    .translate(1.2, 0.85, 1.25)                  // attach to top of neck
    .rotate(g_headYawAngle, 0, 0, 1)       // head turn animation
    .rotate(90,0,0,1)
    .rotate(180, 1, 1, 0)
    .scale(1.5, 0.6, 1.5);                 // head size
  head.render();

  // 4) BEAK (child of head)
  let beak = new Cube();
  beak.color = [1.0, 0.6, 0.0, 1.0];        // orange
  beak.matrix = new Matrix4(head.matrix)
    .translate(0.31, 0.1, 1)                  // extend forward from head
    .scale(0.4, 0.25, 0.3);               // beak size
  beak.render();

  // 4) Eyes
  let lEye = new Cube();
  lEye.color = [1.0, 1.0, 1.0, 1.0];        // black
  lEye.matrix = new Matrix4(head.matrix)
    .translate(0.65, 0.4, 1)                  // extend forward from head
    .scale(0.25, 0.25, 0.05);               // eye size
  lEye.render();
  let lPup = new Cube();
  lPup.color = [0, 0, 0, 1.0];        // black
  lPup.matrix = new Matrix4(lEye.matrix)
    .translate(0.35, 0.3, 1)                  // extend forward from head
    .scale(0.25, 0.25, 0.05);               // pupil size
  lPup.render();
  let rEye = new Cube();
  rEye.color = [1.0, 1.0, 1.0, 1.0];        // black
  rEye.matrix = new Matrix4(head.matrix)
    .translate(0.09, 0.4, 1)                  // extend forward from head
    .scale(0.25, 0.25, 0.05);               // eye size
    rEye.render();
  let rPup = new Cube();
  rPup.color = [0, 0, 0, 1.0];        // black
  rPup.matrix = new Matrix4(rEye.matrix)
    .translate(0.40, 0.3, 1)                  // extend forward from head
    .scale(0.25, 0.25, 0.05);               // beak size
  rPup.render();

  // 5) SAMURAI HELMET (child of head)
  let helmet = new Cube();
  helmet.color = [0.2, 0.2, 0.2, 1.0];      // dark gray
  helmet.matrix = new Matrix4(head.matrix)
    .translate(-0.1, 0.7, -0.15)                  // on top of head
    .scale(1.2, 0.4, 1.3);                 // helmet size
  helmet.render();

  // 6) LEFT WING (child of body)
  let lw = new Cube();
  lw.color = [0.59, 0.29, 0.0, 1.0];          // yellow
  lw.matrix = new Matrix4(body.matrix)
    .translate(0.2, 0.7, 0.85)                 // left side of body
    .rotate(g_leftWingAngle, 0, 0, 1)      // wing flap animation
    .rotate(180,0,1,0)
    .scale(1.3, 0.2, 0.75);                 // wing size
  lw.render();

  // 7) RIGHT WING (child of body)
  let rw = new Cube();
  rw.color = [0.59, 0.29, 0.0, 1.0];
  rw.matrix = new Matrix4(body.matrix)
    .translate(0.8, 0.7, 0.15)                  // right side of body
    .rotate(g_rightWingAngle, 0, 0, 1)     // wing flap animation)
    .scale(1.3, 0.2, 0.75);                 // wing size
    rw.render();

  // 8) LEFT LEG HIERARCHY (leg → knee → foot)
  let ll = new Cube();
  ll.color = [0.8, 0.5, 0.0, 1.0];          // brownish
  ll.matrix = new Matrix4(body.matrix)
    .translate(.1, -0.35, 0.3)              // left side under body
    .rotate(g_leftLegAngle, 1, 0, 0)       // leg swing animation
    .scale(0.3, 0.7, 0.35);               // leg size
  ll.render();

  let lk = new Cube();
  lk.color = [0.6, 0.3, 0.0, 1.0];          // darker brown
  lk.matrix = new Matrix4(ll.matrix)
    .translate(0, -0.9, 0)                 // below leg
    .rotate(-g_leftKneeAngle, 1, 0, 0)      // knee bend animation
    .scale(1.0, 1, 1.0);                 // knee size
  lk.render();

  let lf = new Cube();
  lf.color = [1.0, 0.8, 0.0, 1.0];          // foot color
  lf.matrix = new Matrix4(lk.matrix)
    .translate(-0.15, -0.1, -0.3)               // position foot
    .scale(1.3, 0.2, 1.3);                // foot size
  lf.render();

  // 9) RIGHT LEG HIERARCHY (leg → knee → foot)
  let rl = new Cube();
  rl.color = [0.8, 0.5, 0.0, 1.0];
  rl.matrix = new Matrix4(body.matrix)
    .translate(0.6, -0.35, 0.3)               // right side under body
    .rotate(g_rightLegAngle, 1, 0, 0)      // leg swing animation
    .scale(0.3, 0.7, 0.35);               // leg size
  rl.render();

  let rk = new Cube();
  rk.color = [0.6, 0.3, 0.0, 1.0];          // knee color
  rk.matrix = new Matrix4(rl.matrix)
    .translate(0, -0.9, 0)                 // below leg
    .rotate(-g_rightKneeAngle, 1, 0, 0)     // knee bend animation
    .scale(1.0, 1, 1.0);                 // knee size
  rk.render();

  let rf = new Cube();
  rf.color = [1.0, 0.8, 0.0, 1.0];         // foot color
  rf.matrix = new Matrix4(rk.matrix)
    .translate(-0.15, -0.1, -0.3)               // position foot
    .scale(1.3, 0.2, 1.3);                // foot size
  rf.render();

  // 10) KATANA SWORD (child of beak)
  let swordHilt = new Cube();
  swordHilt.color = [0.3, 0.3, 0.3, 1.0];   // dark gray
  swordHilt.matrix = new Matrix4(beak.matrix)
    .translate(0, 0, 0.8)                  // extend from beak
    .rotate(g_swordAngle, 0, 1, 0)         // sword swing animation
    .rotate(90,0,1,0)
    .scale(0.4, 0.4, 1.2);               // hilt size
  swordHilt.render();

  let swordBlade = new Cube();
  swordBlade.color = [0.8, 0.8, 0.9, 1.0];  // metallic
  swordBlade.matrix = new Matrix4(swordHilt.matrix)
    .translate(0.1, 0, 1)                  // extend from hilt
    .scale(0.7, 0.7, 5.0);                 // blade size
  swordBlade.render();
  
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