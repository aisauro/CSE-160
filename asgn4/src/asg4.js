var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  attribute vec3 a_Normal;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec4 v_VertPos;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_NormalMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal,1)));
    //v_Normal = a_Normal;
    v_VertPos = u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform int u_whichTexture;
  uniform vec3 u_lightPos;
  uniform vec3 u_lightColor;
  uniform vec3 u_cameraPos;
  uniform vec4 v_VertPos;
  uniform bool u_lightOn;
  void main() {
    if (u_whichTexture == 3){
      gl_FragColor = vec4((v_Normal+1.0)/2.0, 1.0); //use Normal
    } else if (u_whichTexture == -2) {
      gl_FragColor = u_FragColor;   // use color
    } else if (u_whichTexture == -1) {
      gl_FragColor = vec4(v_UV,1.0,1.0);    // use UV debug color
    } else if (u_whichTexture == 0) {
      gl_FragColor = texture2D(u_Sampler0, v_UV);   //use texture0
    } else if (u_whichTexture == 1) {
      gl_FragColor = texture2D(u_Sampler1, v_UV);   //use texture1
    } else if (u_whichTexture == 2) {
      gl_FragColor = texture2D(u_Sampler2, v_UV);   //use texture2
    } else {
      gl_FragColor = vec4(1.0,0.2,0.2,1.0);   // error, put redish
    }
    
    vec3 lightVector = u_lightPos-vec3(v_VertPos);
    float r=length(lightVector);
    //if (r<1.0) {
    //  gl_FragColor = vec4(1,0,0,1);
    //} else if (r<2.0) {
    //  gl_FragColor = vec4(0,1,0,1);
    //}

    //gl_FragColor = vec4(vec3(gl_FragColor)/(r*r),1);

    // N dot L
    vec3 L = normalize(lightVector);
    vec3 N = normalize(v_Normal);
    float nDotL = max(dot(N,L), 0.0);

    // Reflection
    vec3 R = reflect(-L, N);

    // Eye
    vec3 E = normalize(u_cameraPos-vec3(v_VertPos));

    // Specular
    float specular = pow(max(dot(E,R), 0.0),64.0) * 0.8; //10,0.5

    //vec3 diffuse = vec3(1.0,1.0,0.9) * vec3(gl_FragColor) * nDotL * 0.7;
    vec3 ambient = vec3(gl_FragColor) * 0.3;
    vec3 diffuse = u_lightColor * vec3(1.0,1.0,0.9) * vec3(gl_FragColor) * nDotL * 0.7;
    //vec3 ambient = u_lightColor * vec3(gl_FragColor) * 0.3;
    if (u_lightOn) {
      if (u_whichTexture == -2) {
        gl_FragColor = vec4(specular+diffuse+ambient, 1.0);
      } else if (u_whichTexture == 0) {
        gl_FragColor = vec4(specular+diffuse+ambient, 1.0);
      } else {
        gl_FragColor = vec4(diffuse+ambient, 1.0);
      }
    }
  }`

//Global Variables
let canvas;
let gl;
let a_Position;
let a_UV;
let a_Normal;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_NormalMatrix
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_whichTexture;
let u_lightPos;
let u_cameraPos;
let u_lightOn;
let u_lightColor;

//let u_texColorWeight;

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

  // Get the storage location of a_Normal
  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if (a_Normal < 0) {
    console.log('Failed to get the storage location of a_Normal');
    return;
  }

  // Get the storage location of u_whichTexture
  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get the storage location of u_whichTexture');
    return;
  }

  // Get the storage location of u_lightOn
  u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
  if (!u_lightOn) {
    console.log('Failed to get the storage location of u_lightOn');
    return;
  }

  // In connectVariablesToGLSL():
  u_lightColor = gl.getUniformLocation(gl.program, 'u_lightColor');
  if (!u_lightColor) {
    console.log('Failed to get the storage location of u_lightColor');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_lightPos
  u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
  if (!u_lightPos) {
    console.log('Failed to get the storage location of u_lightPos');
    return;
  }

  // Get the storage location of u_cameraPos
  u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
  if (!u_cameraPos) {
    console.log('Failed to get the storage location of u_cameraPos');
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
  
  // Get the storage location of u_NormalMatrix
  u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
   if (!u_NormalMatrix) {
       console.log('Failed to get u_NormalMatrix');
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

  // Set an initial value for this matrix to identity
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

}

// Constants
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
let g_normalOn=false;
let g_lightOn=true;
let g_lightPos=[0,1,-2];
let g_lightColor=[1.0, 1.0, 1.0];
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
  // Button Events
  document.getElementById('normalOn').onclick = function() {g_normalOn=true;};
  document.getElementById('normalOff').onclick = function() {g_normalOn=false;};
  document.getElementById('lightOn').onclick = function() {g_lightOn=true;};
  document.getElementById('lightOff').onclick = function() {g_lightOn=false;};

  //canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev)} };
  // Size Slider Events
  document.getElementById('angleSlide').addEventListener('mousemove', function() { g_globalAngle = this.value; renderAllShapes(); });
  document.getElementById('lightSlideX').addEventListener('mousemove', function(ev) { if(ev.buttons == 1)  { g_lightPos[0] = this.value/100; renderAllShapes();}});
  document.getElementById('lightSlideY').addEventListener('mousemove', function(ev) { if(ev.buttons == 1) { g_lightPos[1] = this.value/100; renderAllShapes();}});
  document.getElementById('lightSlideZ').addEventListener('mousemove', function(ev) { if(ev.buttons == 1) { g_lightPos[2] = this.value/100; renderAllShapes();}});

  // Color Slider Events
  document.getElementById('lightR').addEventListener('mouseup', function() { g_lightColor[0] = this.value/100; });
  document.getElementById('lightG').addEventListener('mouseup', function() { g_lightColor[1] = this.value/100; });
  document.getElementById('lightB').addEventListener('mouseup', function() { g_lightColor[2] = this.value/100; });
}

function initTextures() {
  /*Get the storage location of u_texColorWeight
  u_texColorWeight = gl.getUniformLocation(gl.program, 'u_texColorWeight');
  if (!u_texColorWeight) {
    console.log('Failed to get the storage location of u_texColorWeight');
    return;
  }
  */
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
  image1.src = 'emerald.jpg';

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
  // Start the animation loop
  //animate();
}

var g_startTime=performance.now()/1000.0;
var g_seconds=performance.now()/1000.0-g_startTime;
//let g_cycleTime   = 0.0;    // seconds into the cycle
//const g_cycleLen  = 40.0;   // 10s day,10s dusk,10s night,10s dawn
//const MAX_DARKNESS = 0.8; // maximum “darkness” you want at full night (0 = no dark, 1 = pitch-black)
//let u_darkness;             // will hold the uniform location

function tick() {
    /*
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
    */
    g_seconds=performance.now()/1000.0-g_startTime;

    // Update Animation Angles
    updateAnimationAngles();

    // Draw your scene
    renderAllShapes();

    // Loop
    requestAnimationFrame(tick);
}

function updateAnimationAngles() {
  g_lightPos[0] = 2.3*Math.cos(g_seconds);
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
    //case 74: // J
    //  removeBlock();
    //  break;
    //case 75: // K
    //  placeBlock();
    //  break;
    default:
      return; // don't redraw if nothing happens
  }
  
  renderAllShapes(); // re-render the scene
}

//const CUBE_SIZE    = 0.75;
//const HALF_MAP_W   = g_map.length  / 2;
//const HALF_MAP_D   = g_map[0].length / 2;
const MAX_PICK_DIST = 6.0;
const PICK_STEP     = 0.2;

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
  
  // Pass the light position to GLSL
  gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);

  // Pass the camera position to GLSL
  gl.uniform3f(u_cameraPos, g_camera.eye.x, g_camera.eye.y, g_camera.eye.z);
  
  // Pass the light status
  gl.uniform1i(u_lightOn, g_lightOn);

  // Pass light color
  gl.uniform3fv(u_lightColor, g_lightColor);

  // Draw the light
  var light=new Cube();
  light.color= [2,2,0,1];
  light.textureNum=-2;
  light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  light.matrix.scale(.1,.1,.1);
  light.matrix.translate(-.5,-.5,-60);
  //light.matrix.translate(0,1,-2);
  light.render();
  
  // Draw Sphere
  var sp = new Sphere();
  sp.color = [0.8,0.8,0.8,1.0];
  sp.textureNum=-2;
  if (g_normalOn) sp.textureNum=3;
  sp.matrix.translate(0,-1.3,-6);
  //sp.normalMatrix.setInverseOf(sp.matrix).transpose();
  sp.render();
  
  //drawMap();
  
  var test = new Cube();
  test.color = [1.0,0.5,0.5,1];
  test.textureNum = 0;
  if (g_normalOn) test.textureNum=3;
  //test.matrix.translate(.25,-1.75,-1.0);
  test.matrix.translate(1,-2.2,-4);
  //test.matrix.rotate(-5,1,0,0);
  //test.matrix.scale(.5,0.3,.5);
  test.normalMatrix.setInverseOf(test.matrix).transpose();
  test.render();
  
  // Draw the floor
  var floor = new Cube();
  floor.color = [1.0,0.0,0.0,1.0];
  floor.textureNum=1;
  //floor.matrix.translate(-25, -.75, 0.0);
  //floor.matrix.scale(50, 0.01, 50);
  //floor.matrix.rotate(320,1,0,0);
  floor.matrix.translate(0, -2.4, 0.0);
  floor.matrix.scale(10, 0, 10);
  floor.matrix.translate(-.5, 0, -1);
  floor.render();

  // Draw the sky
  var sky = new Cube();
  sky.color = [0.8,0.8,0.8,1.0];
  sky.textureNum=2;
  if (g_normalOn) sky.textureNum=3;
  //sky.matrix.scale(500,500,500);
  //sky.matrix.scale(-5,-5,-5);
  sky.matrix.scale(-10,-10,-10);
  //sky.matrix.translate(-.5, -.5, -.5);
  sky.matrix.translate(-.5, -.5, 0);
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
