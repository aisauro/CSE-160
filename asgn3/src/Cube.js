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
    
}
