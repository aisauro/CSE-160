//
class Cube{
  constructor(){
    this.type='cube';
    //this.position = [0.0, 0.0, 0.0];
    this.color = [1.0,1.0,1.0,1.0];
    //this.size = 5.0;
    //this.segments = 10;
    this.matrix = new Matrix4();
    this.normalMatrix = new Matrix4();
    this.textureNum=-1;
    //this.textureWeight = 0.5; // 0 - no texture, 0.5 - 50% blend, 1.0 - all texture
    this.cubeVerts32 = new Float32Array([
      // Front face
      0, 0, 0,  1, 1, 0,  1, 0, 0,
      0, 0, 0,  0, 1, 0,  1, 1, 0,
      // Top face
      0, 1, 0,  0, 1, 1,  1, 1, 1,
      0, 1, 0,  1, 1, 1,  1, 1, 0,
      // Right face
      1, 1, 0,  1, 1, 1,  1, 0, 0,
      1, 0, 0,  1, 1, 1,  1, 0, 1,
      // Left face
      0, 1, 0,  0, 1, 1,  0, 0, 0,
      0, 0, 0,  0, 1, 1,  0, 0, 1,
      // Bottom face
      0, 0, 0,  0, 0, 1,  1, 0, 1,
      0, 0, 0,  1, 0, 1,  1, 0, 0,
      // Back face
      0, 0, 1,  1, 1, 1,  1, 0, 1,
      0, 0, 1,  0, 1, 1,  1, 1, 1,
    ]);
    this.cubeUVs32 = new Float32Array([
      // Front face
      0, 0,  1, 1,  1, 0,
      0, 0,  0, 1,  1, 1,
      // Top face
      0, 0,  0, 1,  1, 1,
      0, 0,  1, 1,  1, 0,
      // Right face
      0, 0,  1, 1,  1, 0,
      1, 0,  1, 1,  0, 1,
      // Left face
      0, 0,  1, 1,  1, 0,
      0, 0,  0, 1,  1, 1,
      // Bottom face
      0, 0,  0, 1,  1, 1,
      0, 0,  1, 1,  1, 0,
      // Back face
      0, 0,  1, 1,  1, 0,
      0, 0,  0, 1,  1, 1,
    ]);
  }
    
  render() {
    //var xy = this.position;
    var rgba = this.color;
    //var size = this.size;
    //var segments = this.segments;
    
    // Pass the texture number
    gl.uniform1i(u_whichTexture, this.textureNum);

    // Pass the texture blend weight
    //gl.uniform1f(u_texColorWeight, this.textureWeight);

    // Pass the color of a point to u_FragColor uniform variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    
    // Pass the matrix to u_ModelMatrix attribute
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    // Pass the matrix to u_NormalMatrix attribute
    gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMatrix.elements);

    // Front face (z = 0)
    drawTriangle3DUVNormal( 
      [0,0,0, 1,1,0, 1,0,0 ], 
      [1,0, 0,1, 1,1],
      [0,0,-1, 0,0,-1, 0,0,-1]);
    drawTriangle3DUVNormal( 
      [0,0,0, 0,1,0, 1,1,0 ], 
      [0,0, 0,1, 1,1],
      [0,0,-1, 0,0,-1, 0,0,-1]);

    // Pass the color of a point to u_FragColor uniform variable
    //gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
    
    // Top face (y = 1)
    drawTriangle3DUVNormal( 
      [0,1,0, 1,1,0, 1,1,1 ], 
      [0,0, 1,0, 1,1],
      [0,1,0, 0,1,0, 0,1,0]);
    drawTriangle3DUVNormal( 
      [0,1,0, 1,1,1, 0,1,1 ], 
      [0,0, 1,1, 0,1],
      [0,1,0, 0,1,0, 0,1,0]);

    // Back face (z = 1)
    drawTriangle3DUVNormal( 
      [0,0,1, 1,0,1, 1,1,1 ], 
      [0,0, 1,0, 1,1],
      [0,0,1, 0,0,1, 0,0,1]);
    drawTriangle3DUVNormal( 
      [0,0,1, 1,1,1, 0,1,1 ], 
      [0,0, 1,1, 0,1],
      [0,0,1, 0,0,1, 0,0,1]);

    // Bottom face (y = 0)
    drawTriangle3DUVNormal( 
      [0,0,0, 1,0,1, 1,0,0 ], 
      [0,0, 1,1, 1,0],
      [0,-1,0, 0,-1,0, 0,-1,0]);
    drawTriangle3DUVNormal( 
      [0,0,0, 0,0,1, 1,0,1 ], 
      [0,0, 0,1, 1,0],
      [0,-1,0, 0,-1,0, 0,-1,0]);

    // Right face (x = 1)
    drawTriangle3DUVNormal( 
      [1,0,0, 1,1,0, 1,1,1 ], 
      [0,0, 1,0, 1,1],
      [1,0,0, 1,0,0, 1,0,0]);
    drawTriangle3DUVNormal( 
      [1,0,0, 1,1,1, 1,0,1 ], 
      [0,0, 1,1, 0,1],
      [1,0,0, 1,0,0, 1,0,0]);

    // Left face (x = 0)
    drawTriangle3DUVNormal( 
      [0,0,0, 0,1,1, 0,1,0 ], 
      [0,0, 1,1, 1,0],
      [-1,0,0, -1,0,0, -1,0,0]);
    drawTriangle3DUVNormal( 
      [0,0,0, 0,0,1, 0,1,1 ], 
      [0,0, 0,1, 1,1],
      [-1,0,0, -1,0,0, -1,0,0]);

  }
   
  renderFast() {
    
    var rgba = this.color;
    // Pass the texture number
    gl.uniform1i(u_whichTexture, this.textureNum);

    // Pass the texture blend weight
    //gl.uniform1f(u_texColorWeight, this.textureWeight);
    
    // Pass the color of a point to u_FragColor uniform variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    
    // Pass the matrix to u_ModelMatrix attribute
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    if (g_vertexBuffer==null) {
      initTriangle3D();
    }
    gl.bufferData(gl.ARRAY_BUFFER, this.cubeVerts32, gl.DYNAMIC_DRAW);
    
    //
    var uvBuffer = gl.createBuffer();
    if (!uvBuffer) {
      console.log('Failed to create the buffer object');
      return -1;
    }
    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, this.cubeUVs32, gl.DYNAMIC_DRAW);
    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);

    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_UV);
    //
    
    gl.drawArrays(gl.TRIANGLES,0,36);
    
    //drawTriangle3DUVBuffer(this.cubeVerts32, this.cubeUVs32);
  }
}
