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
  uniform sampler2D u_Sampler2;
  uniform int u_whichTexture;
  uniform float u_texColorWeight;
  uniform float u_darkness;            // NEW
  void main() {
    vec4 base;
    if (u_whichTexture == -2) {
      base = u_FragColor;
    } else if (u_whichTexture == -1) {
      base = vec4(v_UV,1.0,1.0);
    } else if (u_whichTexture == 0) {
      base = texture2D(u_Sampler0, v_UV);
    } else if (u_whichTexture == -3) {
      vec4 texColor = texture2D(u_Sampler0, v_UV);
      base = mix(u_FragColor, texColor, u_texColorWeight);
    } else if (u_whichTexture == 1) {
      base = texture2D(u_Sampler1, v_UV);
    } else if (u_whichTexture == 2) {
      base = texture2D(u_Sampler2, v_UV);
    } else {
      base = vec4(1.0,0.2,0.2,1.0);
    }
    // Blend towards black based on time of day
    gl_FragColor = mix(base, vec4(0.0,0.0,0.0,1.0), u_darkness);
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
let u_Sampler2;
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

  // Get the storage location of u_Sampler2
  u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
  if (!u_Sampler2) {
    console.log('Failed to get the storage location of u_Sampler2');
    return;
  }

  // Get the storage location of u_darkness
  u_darkness = gl.getUniformLocation(gl.program, 'u_darkness');
  if (!u_darkness) {
    console.log('Failed to get the storage location of u_darkness');
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
let g_camera;
var g_map = [];
for (let x = 0; x < 32; x++) {
  g_map[x] = [];
  for (let z = 0; z < 32; z++) {
    // Create borders with height 3, rest flat
    if (x == 0 || x == 31 || z == 0 || z == 31) {
      g_map[x][z] = 3;
    } else {
      //g_map[x][z] = 0; // Interior space
      //g_map[x][z] = Math.random() < 0.1 ? 1 : 0;
      // Randomly decide the number of blocks to place at this position
      // For example, values from 0 (no stack) to 3 (a higher stack)
      g_map[x][z] = Math.random() < 0.3 ? Math.floor(Math.random() * 3) : 0;
      // Random stack heights (0-3), adjust the probability (0.3 here means 30% chance to have a stack)
    }
  }
}

// Set up actions for the HTML UI elements
function addActionsForHtmlUI(){
  // MOUSE ROTATE CLICK AND DRAG
  canvas.addEventListener('mousedown', (event) => g_camera.onMouseDown(event));
  canvas.addEventListener('mousemove', (event) => g_camera.onMouseMove(event));
  canvas.addEventListener('mouseup', () => g_camera.onMouseUp());
  // Color Slider Events

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
  var image3 = new Image();  // Create the image object
  if (!image3) {
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

  image3.onload = function() { sendImageToTEXTURE2( image3); };
  image3.src = 'stone.jpg'

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

function sendImageToTEXTURE2(image) {
  var texture = gl.createTexture();   // Create a texture object
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE2);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 2 to the sampler
  gl.uniform1i(u_Sampler2, 2);
  
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
  //g_camera = new Camera(canvas);
  g_camera = new Camera(canvas, g_map, CUBE_SIZE, HALF_MAP_W, HALF_MAP_D);
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
  // Start the animation loop
  //animate();
}

var g_startTime=performance.now()/1000.0;
var g_seconds=performance.now()/1000.0-g_startTime;
let g_cycleTime   = 0.0;    // seconds into the cycle
const g_cycleLen  = 40.0;   // 10s day,10s dusk,10s night,10s dawn
const MAX_DARKNESS = 0.8; // maximum “darkness” you want at full night (0 = no dark, 1 = pitch-black)
let u_darkness;             // will hold the uniform location

function tick() {
    g_cycleTime = (performance.now() / 1000.0) % g_cycleLen;

   let darkness, message;
    if (g_cycleTime < 10.0) {
        darkness = 0.0;
        message   = "It is day";
    } else if (g_cycleTime < 20.0) {
        darkness = (g_cycleTime - 10.0) / 10.0 * MAX_DARKNESS;
        message   = "Night is approaching";
    } else if (g_cycleTime < 30.0) {
        darkness = MAX_DARKNESS;
        message   = "Night has fallen";
    } else {
        darkness = (1.0 - ((g_cycleTime - 30.0) / 10.0)) * MAX_DARKNESS;
        message   = "The night is ending";
   }

    // Send darkness to shader
    gl.uniform1f(u_darkness, darkness);

    // Update on-screen message
    document.getElementById('dayMessage').innerText = message;

    // == NEW: warning flash ==
    const warningEl = document.getElementById('warningMessage');
    if (message === "Night has fallen") {
        const phaseTime = g_cycleTime - 20.0;                // 0→10s in night
        const flashOn  = Math.floor(phaseTime * 2) % 2 === 0; 
        warningEl.style.display = flashOn ? 'block' : 'none';
    } else {
        warningEl.style.display = 'none';
    }

    // Draw your scene
    renderAllShapes();

    // Loop
    requestAnimationFrame(tick);
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
    case 74: // J
      removeBlock();
      break;
    case 75: // K
      placeBlock();
      break;
    default:
      return; // don't redraw if nothing happens
  }
  
  renderAllShapes(); // re-render the scene
}
/*
var g_map = [
[1,1,1,1,1,1,1,1],
[1,0,0,0,0,0,0,1],
[1,0,0,0,0,0,0,1],
[1,0,0,1,1,0,0,1],
[1,0,0,0,0,0,0,1],
[1,0,0,0,0,0,0,1],
[1,0,0,0,0,1,0,1],
[1,0,0,0,0,0,0,1],
];

function drawMap() {
  var body = new Cube();
  body.matrix.translate(0,-.75,0);
  body.matrix.scale(.75,.75,.75);
  for (x=0; x < 16;x++){
    for (z=0; z < 16;z++){
      if (x==0 || x==31 || z==0 || z==31){
        //body = new Cube();
        body.color = [0,0,0,1];
        body.textureNum = 2;
        //body.matrix.translate(0,-.75,0);
        //body.matrix.scale(.5,.5,.5);
        body.matrix.translate(x,0,z);
        body.renderFast();
      }
    }
  }
}
*/
/*
var g_map = [
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 2, 2, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 3, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
];
*/
// Randomly generate 32x32 map
/*
function drawMap() {
  for (let x = 0; x < g_map.length; x++) {
    for (let z = 0; z < g_map[0].length; z++) {
      let height = g_map[x][z]; // height = number of stacked cubes
      for (let y = 0; y < height; y++) {
        let wall = new Cube();
        wall.color = [0.6, 0.6, 0.6, 1];
        wall.textureNum = 2;  // Optional texture
        wall.matrix.translate(0, -0.75, 0); // base alignment
        wall.matrix.scale(0.75, 0.75, 0.75);
        wall.matrix.translate(x - g_map.length / 2, y, z - g_map[0].length / 2);
        wall.renderFast();
      }
    }
  }
}
*/
//
function drawMap() {
  let wall = new Cube();  // Create only one cube object
  wall.color = [0.6, 0.6, 0.6, 1];
  wall.textureNum = 2;  // Optional texture
  for (let x = 0; x < g_map.length; x++) {
    for (let z = 0; z < g_map[0].length; z++) {
      let height = g_map[x][z]; // number of stacked cubes at this (x, z)
      for (let y = 0; y < height; y++) {
        wall.matrix.setIdentity();  // Reset matrix for each cube
        wall.matrix.translate(0, -0.75, 0); // base alignment
        wall.matrix.scale(0.75, 0.75, 0.75);
        wall.matrix.translate(
          x - g_map.length / 2, 
          y, 
          z - g_map[0].length / 2
        );
        wall.renderFast();
      }
    }
  }
}

const CUBE_SIZE    = 0.75;
const HALF_MAP_W   = g_map.length  / 2;
const HALF_MAP_D   = g_map[0].length / 2;
const MAX_PICK_DIST = 6.0;
const PICK_STEP     = 0.2;

function isBlocked(x, z, cameraHeight = 1.0) {
  const fx = x / CUBE_SIZE + HALF_MAP_W;
  const fz = z / CUBE_SIZE + HALF_MAP_D;
  const mx = Math.floor(fx);
  const mz = Math.floor(fz);

  if (mx < 0 || mx >= g_map.length || mz < 0 || mz >= g_map[0].length) return true;

  const blockHeight = g_map[mx][mz] * CUBE_SIZE;
  return cameraHeight <= blockHeight + 0.05;  // small offset to allow standing "on" blocks
}


function pickMapCell() {
  // forward vector
  let f = new Vector3(g_camera.at.elements);
  f.sub(g_camera.eye);
  f.normalize();

  for (let d = PICK_STEP; d <= MAX_PICK_DIST; d += PICK_STEP) {
    let wx = g_camera.eye.elements[0] + f.elements[0] * d;
    let wz = g_camera.eye.elements[2] + f.elements[2] * d;

    // invert the draw‐map transform:
    let fx = wx / CUBE_SIZE + HALF_MAP_W;
    let fz = wz / CUBE_SIZE + HALF_MAP_D;
    let mx = Math.floor(fx);
    let mz = Math.floor(fz);

    if (mx >= 0 && mx < g_map.length &&
        mz >= 0 && mz < g_map[0].length) {
      return { mapX: mx, mapZ: mz };
    }
  }
  return null;
}
/*
function placeBlock() {
  const cell = pickMapCell();
  if (!cell) return;
  const MAX_H = 10;
  if (g_map[cell.mapX][cell.mapZ] < MAX_H)
    g_map[cell.mapX][cell.mapZ]++;
}
*/
function placeBlock() {
  const cell = pickMapCell();
  if (!cell) return;

  const MAX_H = 10;
  const { mapX, mapZ } = cell;

  // 1) Place the block
  if (g_map[mapX][mapZ] < MAX_H) {
    g_map[mapX][mapZ]++;

    // 2) If camera is now inside, push out radially
    const camY = g_camera.eye.elements[1];
    let x = g_camera.eye.elements[0], z = g_camera.eye.elements[2];
    if (isBlocked(x, z, camY)) {
      // Compute block center in world coords
      const centerX = (mapX - HALF_MAP_W + 0.5) * CUBE_SIZE;
      const centerZ = (mapZ - HALF_MAP_D + 0.5) * CUBE_SIZE;

      // Direction from block center → camera
      let dx = x - centerX,
          dz = z - centerZ;
      let len = Math.hypot(dx, dz) || 1;
      dx /= len; dz /= len;

      // Start just outside the cube’s face (half‐width), then step out
      const startDist = CUBE_SIZE * 0.5 + 0.001;
      const STEP = 0.05;
      const MAX_STEPS = 20;

      for (let i = 0; i < MAX_STEPS; i++) {
        const testDist = startDist + i * STEP;
        const testX = centerX + dx * testDist;
        const testZ = centerZ + dz * testDist;
        if (!isBlocked(testX, testZ, camY)) {
          // Found a free spot—apply the offset
          const ox = testX - x;
          const oz = testZ - z;
          g_camera.eye.elements[0] += ox;
          g_camera.eye.elements[2] += oz;
          g_camera.at.elements[0]  += ox;
          g_camera.at.elements[2]  += oz;
          g_camera.updateViewMatrix();
          return;
        }
      }
      console.warn("Might be trapped in block, remove by pressing j");
    }
  }
}

function removeBlock() {
  const cell = pickMapCell();
  if (!cell) return;
  if (g_map[cell.mapX][cell.mapZ] > 0)
    g_map[cell.mapX][cell.mapZ]--;
}

//
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
  drawMap();
  // Draw the floor
  var floor = new Cube();
  floor.color = [1.0,0.0,0.0,1.0];
  floor.textureNum=1;
  floor.matrix.translate(-25, -.75, 0.0);
  floor.matrix.scale(50, 0.01, 50);
  floor.matrix.rotate(320,1,0,0);
  //floor.matrix.translate(-.5, 0, 0.5);
  floor.renderFast();

  // Draw the sky
  var sky = new Cube();
  sky.color = [0.0,0.0,1.0,1.0];
  sky.textureNum=-2;
  sky.matrix.scale(500,500,500);
  sky.matrix.translate(-.5, -.5, -0.5);
  sky.renderFast();

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
