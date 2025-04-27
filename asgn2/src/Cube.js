class Cube{
  constructor(){
    this.type='cube';
    //this.position = [0.0, 0.0, 0.0];
    this.color = [1.0,1.0,1.0,1.0];
    //this.size = 5.0;
    //this.segments = 10;
    this.matrix = new Matrix4();
  }
    
  render() {
    //var xy = this.position;
    var rgba = this.color;
    //var size = this.size;
    //var segments = this.segments;
      
    // Pass the color of a point to u_FragColor uniform variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
      
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    /*
    // Front of cube (z = 0)
    drawTriangle3D( [0.0,0.0,0.0, 1.0,1.0,0.0, 1.0,0.0,0.0 ]);
    drawTriangle3D( [0.0,0.0,0.0, 0.0,1.0,0.0, 1.0,1.0,0.0 ]);

    // Top of cube (y = 1)
    drawTriangle3D( [0.0,1.0,0.0, 1.0,1.0,0.0, 1.0,1.0,1.0 ]);
    drawTriangle3D( [0.0,1.0,0.0, 1.0,1.0,1.0, 0.0,1.0,1.0 ]);

    // Back of cube (z = 1)
    drawTriangle3D( [0.0,0.0,1.0, 1.0,0.0,1.0, 1.0,1.0,1.0 ]);
    drawTriangle3D( [0.0,0.0,1.0, 1.0,1.0,1.0, 0.0,1.0,1.0 ]);

    // Bottom of cube (y = 0)
    drawTriangle3D( [0.0,0.0,0.0, 1.0,0.0,1.0, 1.0,0.0,0.0 ]);
    drawTriangle3D( [0.0,0.0,0.0, 0.0,0.0,1.0, 1.0,0.0,1.0 ]);

    // Right of cube (x = 0)
    drawTriangle3D( [1.0,0.0,0.0, 1.0,1.0,0.0, 1.0,1.0,1.0 ]);
    drawTriangle3D( [1.0,0.0,0.0, 1.0,1.0,1.0, 1.0,0.0,1.0 ]);

    // Left of cube (x = 1)
    drawTriangle3D( [0.0,0.0,0.0, 1.0,1.0,0.0, 0.0,1.0,0.0 ]);
    drawTriangle3D( [0.0,0.0,0.0, 0.0,1.0,0.0, 0.0,1.0,1.0 ]);
    */
    // Front face (z = 0)
    drawTriangle3D([0, 0, 0, 1, 1, 0, 1, 0, 0]);
    drawTriangle3D([0, 0, 0, 0, 1, 0, 1, 1, 0]);

    // Pass the color of a point to u_FragColor uniform variable
    gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
    
    // Top face (y = 1)
    drawTriangle3D([0, 1, 0, 1, 1, 0, 1, 1, 1]);
    drawTriangle3D([0, 1, 0, 1, 1, 1, 0, 1, 1]);
    
    // Back face (z = 1)
    drawTriangle3D([0, 0, 1, 1, 0, 1, 1, 1, 1]);
    drawTriangle3D([0, 0, 1, 1, 1, 1, 0, 1, 1]);

    // Bottom face (y = 0)
    drawTriangle3D([0, 0, 0, 1, 0, 1, 1, 0, 0]);
    drawTriangle3D([0, 0, 0, 0, 0, 1, 1, 0, 1]);

    // Right face (x = 1)
    drawTriangle3D([1, 0, 0, 1, 1, 0, 1, 1, 1]);
    drawTriangle3D([1, 0, 0, 1, 1, 1, 1, 0, 1]);

    // Left face (x = 0)
    drawTriangle3D([0, 0, 0, 0, 1, 1, 0, 1, 0]);
    drawTriangle3D([0, 0, 0, 0, 0, 1, 0, 1, 1]);
    
  }
    
}
