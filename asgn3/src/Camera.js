class Camera {
  constructor(canvas) {
    this.fov = 60;
    this.eye = new Vector3([0, 0, 0]);
    this.at = new Vector3([0, 0, -1]);
    this.up = new Vector3([0, 1, 0]);

    this.viewMatrix = new Matrix4();
    this.projectionMatrix = new Matrix4();

    this.updateViewMatrix();

    this.projectionMatrix.setPerspective(
      this.fov,
      canvas.width / canvas.height,
      0.1,
      1000
    );

    this.isDragging = false;
    this.lastMouseX = 0;
  }

  // Method to update camera yaw (horizontal rotation)
  setYaw(deltaX) {
    const sensitivity = 0.3;  // Adjust sensitivity for smoother or quicker rotation
    this.yaw += deltaX * sensitivity;
        
    // Normalize yaw to prevent it from going beyond 360 or below 0
    if (this.yaw > 360) this.yaw -= 360;
    if (this.yaw < 0) this.yaw += 360;

    // Update the "at" vector based on the new yaw
    const f = this.at.clone().sub(this.eye).normalize(); // Forward vector
    const rotationMatrix = new Matrix4();
    rotationMatrix.setRotate(this.yaw, this.up.x, this.up.y, this.up.z);  // Apply yaw to forward vector
    const fPrime = rotationMatrix.multiplyVector3(f);

    // Update 'at' position based on new yaw
    this.at = this.eye.clone().add(fPrime);
  }

  updateViewMatrix() {
    this.viewMatrix.setLookAt(
      this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
      this.at.elements[0], this.at.elements[1], this.at.elements[2],
      this.up.elements[0], this.up.elements[1], this.up.elements[2]
    );
  }

  moveForward(speed) {
    let f = new Vector3(this.at.elements);
    f.sub(this.eye);
    f.normalize();
    f.mul(speed);
    this.eye.add(f);
    this.at.add(f);
    this.updateViewMatrix();
  }

  moveBackwards(speed) {
    let b = new Vector3(this.eye.elements);
    b.sub(this.at);
    b.normalize();
    b.mul(speed);
    this.eye.add(b);
    this.at.add(b);
    this.updateViewMatrix();
  }

  moveLeft(speed) {
    let f = new Vector3(this.at.elements);
    f.sub(this.eye);
    //f.normalize();

    //let s = Vector3.cross(this.up, f);
    let s = Vector3.cross(new Vector3(this.up.elements), f);
    s.normalize();
    s.mul(speed);

    this.eye.add(s);
    this.at.add(s);
    this.updateViewMatrix();
  }

  moveRight(speed) {
    let f = new Vector3(this.at.elements);
    f.sub(this.eye);
    //f.normalize();

    //let s = Vector3.cross(f, this.up);
    let s = Vector3.cross(f, new Vector3(this.up.elements));
    s.normalize();
    s.mul(speed);

    this.eye.add(s);
    this.at.add(s);
    this.updateViewMatrix();
  }

  panLeft(alpha) {
    let f = new Vector3(this.at.elements);
    f.sub(this.eye);

    let rotationMatrix = new Matrix4();
    rotationMatrix.setRotate(alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);

    let f_prime = rotationMatrix.multiplyVector3(f);
    this.at = new Vector3(this.eye.elements);
    this.at.add(f_prime);
    this.updateViewMatrix();
  }

  panRight(alpha) {
    this.panLeft(-alpha); // just panLeft with negative angle
  }
  // Mouse drag start event
  onMouseDown(event) {
    // Start the drag
    this.isDragging = true;
    this.lastMouseX = event.clientX;
  }

  // Mouse drag move event
  onMouseMove(event) {
    if (this.isDragging) {
      // Calculate delta movement
      const deltaX = event.clientX - this.lastMouseX;

      // Apply delta to rotate the camera
      const sensitivity = 0.1;  // Adjust sensitivity for faster/slower rotation
      this.panLeft(deltaX * sensitivity);

      // Update the last mouse position for the next frame
      this.lastMouseX = event.clientX;
    }
  }

  // Mouse drag end event
  onMouseUp() {
    // End the drag
    this.isDragging = false;
  }
}
