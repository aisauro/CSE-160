// DrawTriangle.js (c) 2012 matsuda and copying Lab video from Youtube
let canvas, ctx;

function main() {  
  // Retrieve <canvas> element
  canvas = document.getElementById('cnv1');  
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  } 

  // Get the rendering context for 2DCG
  ctx = canvas.getContext('2d');

  //Draw a black rectangle
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set color to black
  ctx.fillRect(0, 0, canvas.width, canvas.height);        // Fill a rectangle with the color

  /*let v1 = new Vector3([2.25, 2.25, 0]);
  drawVector(v1, 'red');*/
}

function handleDrawEvent(){
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let x1 = parseFloat(document.getElementById('x1').value);
  let y1 = parseFloat(document.getElementById('y1').value);
  let v1 = new Vector3([x1, y1, 0]);
  drawVector(v1, 'red');

  var x2 = parseFloat(document.getElementById('x2').value);
  var y2 = parseFloat(document.getElementById('y2').value);
  var v2 = new Vector3([x2, y2, 0]); // z is 0 for 2D vectors
  drawVector(v2, 'blue');
}

function drawVector(v, color) {
  let scale = 20;
  let x = v.elements[0] * scale;
  let y = v.elements[1] * scale;

  let cx = canvas.width / 2;
  let cy = canvas.height / 2;

  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + x, cy - y)
  ctx.strokeStyle = color;
  ctx.stroke()
}

function handleDrawOperationEvent() {
  /*var canvas = document.getElementById("webgl");
  var gl = getWebGLContext(canvas);
  clearCanvas(gl);*/
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let v1 = new Vector3([
      parseFloat(document.getElementById("x1").value),
      parseFloat(document.getElementById("y1").value),
      0
  ]);
  drawVector(v1, "red");
  let v2 = new Vector3([
      parseFloat(document.getElementById("x2").value),
      parseFloat(document.getElementById("y2").value),
      0
  ]);
  drawVector(v2, "blue");

  let op = document.getElementById("operation").value;
  let scalar = parseFloat(document.getElementById("scalar").value);

  if (op === "add") {
      let v3 = new Vector3(v1.elements); // clone
      v3.add(v2);
      drawVector(v3, "green");

  } else if (op === "sub") {
      let v3 = new Vector3(v1.elements);
      v3.sub(v2);
      drawVector(v3, "green");

  } else if (op === "mul") {
      let v3 = new Vector3(v1.elements).mul(scalar);
      let v4 = new Vector3(v2.elements).mul(scalar);
      drawVector(v3, "green");
      drawVector(v4, "green");

  } else if (op === "div") {
      let v3 = new Vector3(v1.elements).div(scalar);
      let v4 = new Vector3(v2.elements).div(scalar);
      drawVector(v3, "green");
      drawVector(v4, "green");
  } else if (op === "mag") {
    console.log("Magnitude of v1:", v1.magnitude());
    console.log("Magnitude of v2:", v2.magnitude());
  } else if (op === "norm") {
    let v3 = new Vector3(v1.elements).normalize(scalar);
    let v4 = new Vector3(v2.elements).normalize(scalar);
    drawVector(v3, "green");
    drawVector(v4, "green");
  }
}
