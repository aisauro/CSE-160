class Camera {
  /*
  constructor(canvas) {
    this.fov = 60;
    this.eye = new Vector3([0, 0, 0]);
    this.at = new Vector3([0, 0, -1]);
    this.up = new Vector3([0, 1, 0]);
    this.yaw = 0;

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
  */
  constructor(canvas, g_map, CUBE_SIZE, HALF_MAP_W, HALF_MAP_D) {
    this.g_map = g_map;
    this.CUBE_SIZE = CUBE_SIZE;
    this.HALF_MAP_W = HALF_MAP_W;
    this.HALF_MAP_D = HALF_MAP_D;
    this.fov = 60;
    this.eye = new Vector3([0, 0, 0]);
    this.at = new Vector3([0, 0, -1]);
    this.up = new Vector3([0, 1, 0]);
    this.yaw = 0;

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
    /*
    let f = new Vector3(this.at.elements);
    f.sub(this.eye);
    f.normalize();
    f.mul(speed);
    this.eye.add(f);
    this.at.add(f);
    this.updateViewMatrix();
    */
    // Step 1: Calculate the direction to move
    let dir = new Vector3(this.at.elements);
    dir.sub(this.eye).normalize().mul(speed);
    // Step 3: Call checkCollisionAndSlide to get the corrected movement vector
    let slide = this.checkCollisionAndSlide(dir);

    // Step 5: Apply the corrected movement if the slide vector is non-zero
    if (slide.x !== 0 || slide.y !== 0 || slide.z !== 0) {
      this.eye.add(slide);
      this.at.add(slide);
    }

    // Step 6: Update the view matrix after the movement
    this.updateViewMatrix();
  }

  moveBackwards(speed) {
    /*
    let b = new Vector3(this.eye.elements);
    b.sub(this.at);
    b.normalize();
    b.mul(speed);
    this.eye.add(b);
    this.at.add(b);
    this.updateViewMatrix();
    */
   // 1) Compute desired move (backwards is just –forward)
    let dir = new Vector3(this.eye.elements);
    dir.sub(this.at).normalize().mul(speed);

    // 2) Collision + slide
    let slide = this.checkCollisionAndSlide(dir);

    // 3) Apply movement if non-zero
    if (slide.x !== 0 || slide.y !== 0 || slide.z !== 0) {
      this.eye.add(slide);
      this.at.add(slide);
    }

    // 4) Update view
    this.updateViewMatrix();
  }

  moveLeft(speed) {
    /*
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
    */
    // 1) Compute desired move (left = cross(up, forward))
    let forward = new Vector3(this.at.elements);
    forward.sub(this.eye).normalize();
    let left = Vector3.cross(new Vector3(this.up.elements), forward).normalize().mul(speed);

    // 2) Collision + slide
    let slide = this.checkCollisionAndSlide(left);

    // 3) Apply movement if non-zero
    if (slide.x !== 0 || slide.y !== 0 || slide.z !== 0) {
      this.eye.add(slide);
      this.at.add(slide);
    }

    // 4) Update view
    this.updateViewMatrix();
  }

  moveRight(speed) {
    /*
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
    */
    // 1) Compute desired move (right = cross(forward, up))
    let forward = new Vector3(this.at.elements);
    forward.sub(this.eye).normalize();
    let right = Vector3.cross(forward, new Vector3(this.up.elements)).normalize().mul(speed);

    // 2) Collision + slide
    let slide = this.checkCollisionAndSlide(right);

    // 3) Apply movement if non-zero
    if (slide.x !== 0 || slide.y !== 0 || slide.z !== 0) {
      this.eye.add(slide);
      this.at.add(slide);
    }

    // 4) Update view
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
  /*
  checkCollisionAndSlide(desiredMove) {
    const MARGIN = 0.19;  // how far from the cube face we stop

    // 1) full new position if we moved
    const ex = this.eye.elements[0] + desiredMove.elements[0];
    const ez = this.eye.elements[2] + desiredMove.elements[2];

    // 2) compute the direction signs
    const sx = Math.sign(desiredMove.elements[0]);
    const sz = Math.sign(desiredMove.elements[2]);

    // 3) apply margin along each axis for collision testing
    const testX = ex + sx * MARGIN;
    const testZ = ez + sz * MARGIN;

    // 4) map‐cell of that test point
    const fx = testX / this.CUBE_SIZE + this.HALF_MAP_W;
    const fz = testZ / this.CUBE_SIZE + this.HALF_MAP_D;
    const mx = Math.floor(fx);
    const mz = Math.floor(fz);

    // 5) out of bounds → no move
    if (mx < 0 || mx >= this.g_map.length ||
        mz < 0 || mz >= this.g_map[0].length) {
      return new Vector3([0,0,0]);
    }

    // 6) if there’s a block there, we collide
    if (this.g_map[mx][mz] > 0) {
      // --- try X only ---
      let canX = false;
      if (desiredMove.elements[0] !== 0) {
        const tx = this.eye.elements[0] + desiredMove.elements[0] + sx * MARGIN;
        const tz = this.eye.elements[2];
        const mxX = Math.floor(tx  / this.CUBE_SIZE + this.HALF_MAP_W);
        const mzX = Math.floor(tz  / this.CUBE_SIZE + this.HALF_MAP_D);
        if (
          mxX >= 0 && mxX < this.g_map.length &&
          mzX >= 0 && mzX < this.g_map[0].length &&
          this.g_map[mxX][mzX] === 0
        ) canX = true;
      }

      // --- try Z only ---
      let canZ = false;
      if (desiredMove.elements[2] !== 0) {
        const tx = this.eye.elements[0];
        const tz = this.eye.elements[2] + desiredMove.elements[2] + sz * MARGIN;
        const mxZ = Math.floor(tx / this.CUBE_SIZE + this.HALF_MAP_W);
        const mzZ = Math.floor(tz / this.CUBE_SIZE + this.HALF_MAP_D);
        if (
          mxZ >= 0 && mxZ < this.g_map.length &&
          mzZ >= 0 && mzZ < this.g_map[0].length &&
          this.g_map[mxZ][mzZ] === 0
        ) canZ = true;
      }

      // return only the axes that are free
      return new Vector3([
        canX ? desiredMove.elements[0] : 0,
        0,
        canZ ? desiredMove.elements[2] : 0
      ]);
    }

    // 7) no block in the path → full move OK
    return new Vector3([
      desiredMove.elements[0],
      desiredMove.elements[1],
      desiredMove.elements[2]
    ]);
  }
  */
  // inside your Camera class

// How big around the camera we check (in world units)

checkCollisionAndSlide(desiredMove) {
  let CAMERA_RADIUS = 0.05;
  // current camera XZ
  const ex = this.eye.elements[0];
  const ez = this.eye.elements[2];

  // attempted new position
  const nx = ex + desiredMove.elements[0];
  const nz = ez + desiredMove.elements[2];

  // helper: is (wx,wz) colliding?
  const collides = (wx, wz) => {
    const mx = Math.floor(wx / this.CUBE_SIZE + this.HALF_MAP_W);
    const mz = Math.floor(wz / this.CUBE_SIZE + this.HALF_MAP_D);
    if (mx < 0 || mx >= this.g_map.length || mz < 0 || mz >= this.g_map[0].length) 
      return false;  // out of map = no block
    return this.g_map[mx][mz] > 0;
  };

  // test all four corners of camera’s square
  const corners = [
    [nx + CAMERA_RADIUS, nz + CAMERA_RADIUS],
    [nx - CAMERA_RADIUS, nz + CAMERA_RADIUS],
    [nx + CAMERA_RADIUS, nz - CAMERA_RADIUS],
    [nx - CAMERA_RADIUS, nz - CAMERA_RADIUS],
  ];

  // if none of the corners collide, full move is fine
  let blocked = corners.some(([wx, wz]) => collides(wx, wz));
  if (!blocked) {
    return new Vector3([
      desiredMove.elements[0],
      desiredMove.elements[1],
      desiredMove.elements[2]
    ]);
  }

  // otherwise we’re blocked — try sliding on each axis separately:

  // X-only attempt
  const nxX = ex + desiredMove.elements[0];
  const cornersX = [
    [nxX + CAMERA_RADIUS, ez + CAMERA_RADIUS],
    [nxX - CAMERA_RADIUS, ez + CAMERA_RADIUS],
    [nxX + CAMERA_RADIUS, ez - CAMERA_RADIUS],
    [nxX - CAMERA_RADIUS, ez - CAMERA_RADIUS],
  ];
  let blockedX = cornersX.some(([wx, wz]) => collides(wx, wz));

  // Z-only attempt
  const nzZ = ez + desiredMove.elements[2];
  const cornersZ = [
    [ex + CAMERA_RADIUS, nzZ + CAMERA_RADIUS],
    [ex - CAMERA_RADIUS, nzZ + CAMERA_RADIUS],
    [ex + CAMERA_RADIUS, nzZ - CAMERA_RADIUS],
    [ex - CAMERA_RADIUS, nzZ - CAMERA_RADIUS],
  ];
  let blockedZ = cornersZ.some(([wx, wz]) => collides(wx, wz));

  // Build the slide vector: allow axis that isn’t blocked
  return new Vector3([
    blockedX ? 0 : desiredMove.elements[0],
    0,
    blockedZ ? 0 : desiredMove.elements[2]
  ]);
  }


}
