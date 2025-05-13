class Cube{
  constructor(){
    this.type='cube';
    //this.position = [0.0, 0.0, 0.0];
    this.color = [1.0,1.0,1.0,1.0];
    //this.size = 5.0;
    //this.segments = 10;
    this.matrix = new Matrix4();
    this.textureNum=-1;
    this.textureWeight = 0.5; // 0 - no texture, 0.5 - 50% blend, 1.0 - all texture
    this.cubeVerts32 = new Float32Array([
      /*0,0,0, 1,1,0, 1,0,0
      ,
      0,0,0, 0,1,0, 1,1,0
      ,
      0,1,0, 0,1,1, 1,1,1
      ,
      0,1,0, 1,1,1, 1,1,0
      ,
      1,1,0, 1,1,1, 1,0,0
      ,
      1,0,0, 1,1,1, 1,0,1
      ,
      0,1,0, 0,1,1, 0,0,0
      ,
      0,0,0, 0,1,1, 0,0,1
      ,
      0,0,0, 0,0,1, 1,0,1
      ,
      0,0,0, 1,0,1, 1,0,0
      ,
      0,0,1, 1,1,1, 1,0,1
      ,
      0,0,1, 0,1,1, 1,1,1*/
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
    gl.uniform1f(u_texColorWeight, this.textureWeight);

    // Pass the color of a point to u_FragColor uniform variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    
    // Pass the matrix to u_ModelMatrix attribute
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    // Front face (z = 0)
    drawTriangle3DUV( [0,0,0, 1,1,0, 1,0,0 ], [1,0, 0,1, 1,1]);
    drawTriangle3DUV( [0,0,0, 0,1,0, 1,1,0 ], [0,0, 0,1, 1,1]);

    // Pass the color of a point to u_FragColor uniform variable
    gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
    
    // Top face (y = 1)
    drawTriangle3DUV( [0,1,0, 1,1,0, 1,1,1 ], [0,0, 1,0, 1,1]);
    drawTriangle3DUV( [0,1,0, 1,1,1, 0,1,1 ], [0,0, 1,1, 0,1]);
    //drawTriangle3D([0, 1, 0, 1, 1, 0, 1, 1, 1]);
    //drawTriangle3D([0, 1, 0, 1, 1, 1, 0, 1, 1]);
    
    // Back face (z = 1)
    drawTriangle3DUV( [0,0,1, 1,0,1, 1,1,1 ], [0,0, 1,0, 1,1]);
    drawTriangle3DUV(	[0,0,1, 1,1,1, 0,1,1 ], [0,0, 1,1, 0,1]);
    //drawTriangle3D([0, 0, 1, 1, 0, 1, 1, 1, 1]);
    //drawTriangle3D([0, 0, 1, 1, 1, 1, 0, 1, 1]);

    // Bottom face (y = 0)
    drawTriangle3DUV( [0,0,0, 1,0,1, 1,0,0 ], [0,0, 1,1, 1,0]);
    drawTriangle3DUV( [0,0,0, 0,0,1, 1,0,1 ], [0,0, 0,1, 1,0]);
    //drawTriangle3D([0, 0, 0, 1, 0, 1, 1, 0, 0]);
    //drawTriangle3D([0, 0, 0, 0, 0, 1, 1, 0, 1]);

    // Right face (x = 1)
    drawTriangle3DUV( [1,0,0, 1,1,0, 1,1,1 ], [0,0, 1,0, 1,1]);
    drawTriangle3DUV( [1,0,0, 1,1,1, 1,0,1 ], [0,0, 1,1, 0,1]);
    //drawTriangle3D([1, 0, 0, 1, 1, 0, 1, 1, 1]);
    //drawTriangle3D([1, 0, 0, 1, 1, 1, 1, 0, 1]);

    // Left face (x = 0)
    drawTriangle3DUV(	[0,0,0, 0,1,1, 0,1,0 ], [0,0, 1,1, 1,0]);
    drawTriangle3DUV( [0,0,0, 0,0,1, 0,1,1 ], [0,0, 0,1, 1,1]);
    //drawTriangle3D([0, 0, 0, 0, 1, 1, 0, 1, 0]);
    ///s/sdrawTriangle3D([0, 0, 0, 0, 0, 1, 0, 1, 1]);

  }
   
  renderFast() {
    /*
    //var xy = this.position;
    var rgba = this.color;
    //var size = this.size;
    //var segments = this.segments;
    
    // Pass the texture number
    gl.uniform1i(u_whichTexture, this.textureNum);

    // Pass the texture blend weight
    gl.uniform1f(u_texColorWeight, this.textureWeight);

    // Pass the color of a point to u_FragColor uniform variable
    //gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    
    // Pass the matrix to u_ModelMatrix attribute
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    var allverts=[];
    // Front face (z = 0)
    allverts=allverts.concat( [0,0,0, 1,1,0, 1,0,0]);
    allverts=allverts.concat( [0,0,0, 0,1,0, 1,1,0]);

    // Pass the color of a point to u_FragColor uniform variable
    gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
    
    // Top face (y = 1)
    allverts=allverts.concat( [0,1,0, 0,1,1, 1,1,1]);
    allverts=allverts.concat( [0,1,0, 1,1,1, 1,1,0]);
    
    // Back face (z = 1)
    allverts=allverts.concat( [0,0,1, 1,1,1, 1,0,1]);
    allverts=allverts.concat( [0,0,1, 0,1,1, 1,1,1]);

    // Bottom face (y = 0)
    allverts=allverts.concat( [0,0,0, 0,0,1, 1,0,1]);
    allverts=allverts.concat( [0,0,0, 1,0,1, 1,0,0]);

    // Right face (x = 1)
    allverts=allverts.concat( [1,1,0, 1,1,1, 1,0,0]);
    allverts=allverts.concat( [1,0,0, 1,1,1, 1,0,1]);

    // Left face (x = 0)
    allverts=allverts.concat( [0,1,0, 0,1,1, 0,0,0]);
    allverts=allverts.concat( [0,0,0, 0,1,1, 0,0,1]);
    drawTriangle3D(allverts);
    */
    
    var rgba = this.color;
    // Pass the texture number
    gl.uniform1i(u_whichTexture, this.textureNum);

    // Pass the texture blend weight
    gl.uniform1f(u_texColorWeight, this.textureWeight);
    
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
