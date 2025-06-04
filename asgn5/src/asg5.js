import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

/*
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );

camera.position.z = 5;

function animate() {

  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  renderer.render( scene, camera );

}
*/
function main() {

	const canvas = document.querySelector( '#c' );
	const renderer = new THREE.WebGLRenderer( { antialias: true, canvas } );

	const fov = 75; //45
	const aspect = 2; // the canvas default
	const near = 0.1;
	const far = 50;
	const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
	//camera.position.z = 2;
	camera.position.set( 0, 0, 2 );

	class MinMaxGUIHelper {

		constructor( obj, minProp, maxProp, minDif ) {

			this.obj = obj;
			this.minProp = minProp;
			this.maxProp = maxProp;
			this.minDif = minDif;

		}
		get min() {

			return this.obj[ this.minProp ];

		}
		set min( v ) {

			this.obj[ this.minProp ] = v;
			this.obj[ this.maxProp ] = Math.max( this.obj[ this.maxProp ], v + this.minDif );

		}
		get max() {

			return this.obj[ this.maxProp ];

		}
		set max( v ) {

			this.obj[ this.maxProp ] = v;
			this.min = this.min; // this will call the min setter

		}

	}

	function updateCamera() {

		camera.updateProjectionMatrix();

	}

	const gui = new GUI();
	const cameraFolder = gui.addFolder('Camera Controls');
	cameraFolder.add( camera, 'fov', 1, 180 ).onChange( updateCamera );
	const minMaxGUIHelper = new MinMaxGUIHelper( camera, 'near', 'far', 0.1 );
	cameraFolder.add( minMaxGUIHelper, 'min', 0.1, 50, 0.1 ).name( 'near' ).onChange( updateCamera );
	cameraFolder.add( minMaxGUIHelper, 'max', 0.1, 50, 0.1 ).name( 'far' ).onChange( updateCamera );
	
	const controls = new OrbitControls( camera, canvas );
	//controls.target.set( 0, 5, 0 );
	//controls.update();

	const scene = new THREE.Scene();
	//scene.background = new THREE.Color( 'black' );

	{
		/*
		const planeSize = 40;

		const loader = new THREE.TextureLoader();
		const texture = loader.load( 'https://threejs.org/manual/examples/resources/images/checker.png' );
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.magFilter = THREE.NearestFilter;
		//texture.colorSpace = THREE.SRGBColorSpace;
		const repeats = planeSize / 2;
		texture.repeat.set( repeats, repeats );

		const planeGeo = new THREE.PlaneGeometry( planeSize, planeSize );
		const planeMat = new THREE.MeshPhongMaterial( {
			map: texture,
			side: THREE.DoubleSide,
		} );
		const mesh = new THREE.Mesh( planeGeo, planeMat );
		mesh.rotation.x = Math.PI * - .5;
		mesh.position.set(0,-1.55, 0);
		scene.add( mesh );
		*/
		const planeSize = 40;

		const loader = new THREE.TextureLoader();
		const texture = loader.load( 'stone.jpg' );
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.magFilter = THREE.NearestFilter;
		//texture.colorSpace = THREE.SRGBColorSpace;
		const repeats = planeSize / 2;
		texture.repeat.set( repeats, repeats );

		const planeGeo = new THREE.PlaneGeometry( planeSize, planeSize );
		const planeMat = new THREE.MeshPhongMaterial( {
			map: texture,
			side: THREE.DoubleSide,
		} );
		const mesh = new THREE.Mesh( planeGeo, planeMat );
		mesh.rotation.x = Math.PI * - .5;
		mesh.position.set(0,-1.55, 0);
		scene.add( mesh );
	}
	
	class ColorGUIHelper {
		constructor( object, prop ) {
			this.object = object;
			this.prop = prop;
		}
		get value() {
			return `#${this.object[ this.prop ].getHexString()}`;
		}
		set value( hexString ) {
			this.object[ this.prop ].set( hexString );
		}

	}
	/*
	{

		const color = 0xFFFFFF;
		const intensity = 3;
		const light = new THREE.DirectionalLight( color, intensity );
		light.position.set( - 1, 2, 4 );
		scene.add( light );

	}
	*/
	{

		const color = 0xFFFFFF;
		const intensity = 1; //3
		const light = new THREE.DirectionalLight( color, intensity );
		//light.position.set( -1, 2, 4 );
		/*
		light.position.set( 0, 6, 0 );
		light.target.position.set( -5, -2, 0 );
		*/
		light.position.set( 0, 2, -1 );
		light.target.position.set( -5, -1, 0 );
		scene.add( light );
		scene.add( light.target );

		//const gui = new GUI();
		const dirLightFolder = gui.addFolder('Directional Light');
		dirLightFolder.addColor( new ColorGUIHelper( light, 'color' ), 'value' ).name( 'color' );
		dirLightFolder.add( light, 'intensity', 0, 5, 0.01 );
		dirLightFolder.add( light.target.position, 'x', - 10, 10 );
		dirLightFolder.add( light.target.position, 'z', - 10, 10 );
		dirLightFolder.add( light.target.position, 'y', -10, 10 );

	}
	
	{

		const color = 0xFFFFFF;
		const intensity = 1; //1
		const light = new THREE.AmbientLight( color, intensity );
		scene.add( light );

		//const gui = new GUI();
		const ambientLightFolder = gui.addFolder('Ambient Light');
		ambientLightFolder.addColor( new ColorGUIHelper( light, 'color' ), 'value' ).name( 'Ambient Light Color' );
		ambientLightFolder.add( light, 'intensity', 0, 5, 0.01 ).name('Ambient Light Intensity');

	}

	{

		const color = 0xFFFFFF;
		const intensity = 150;
		const light = new THREE.SpotLight( color, intensity );
		light.position.set( 2, -1, 2 );
		light.target.position.set( 0, 2, -4 );
		scene.add( light );
		scene.add( light.target );
		/*
		const helper = new THREE.SpotLightHelper( light );
		scene.add( helper );
		*/
	}
	
	const boxWidth = .75; // All 1s
	const boxHeight = .75;
	const boxDepth = .75;
	const geometry = new THREE.BoxGeometry( boxWidth, boxHeight, boxDepth );

	function makeInstance( geometry, color, x ) {

		const material = new THREE.MeshPhongMaterial( { color } );

		const cube = new THREE.Mesh( geometry, material );
		scene.add( cube );

		cube.position.x = x;

		return cube;

	}

	const cubes = [
		//makeInstance( geometry, 0x44aa88, 0 ),
		//makeInstance( geometry, 0x8844aa, - 2 ),
		//makeInstance( geometry, 0xaa8844, 2 ),
	];

	// ADD SPHERE
	const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
	const sphereMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
	const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
	sphere.position.set(-2, 0, 0);
	scene.add(sphere);
	cubes.push(sphere);

	// ADD CYLINDER
	const cylinderGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1, 32);
	const cylinderMaterial = new THREE.MeshPhongMaterial({ color: 0x0000ff });
	const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
	cylinder.position.set(2, 0, 0);
	scene.add(cylinder);
	cubes.push(cylinder);

	{

		const loader = new THREE.CubeTextureLoader();
		const texture = loader.load( [
			'https://threejs.org/manual/examples/resources/images/cubemaps/computer-history-museum/pos-x.jpg',
			'https://threejs.org/manual/examples/resources/images/cubemaps/computer-history-museum/neg-x.jpg',
			'https://threejs.org/manual/examples/resources/images/cubemaps/computer-history-museum/pos-y.jpg',
			'https://threejs.org/manual/examples/resources/images/cubemaps/computer-history-museum/neg-y.jpg',
			'https://threejs.org/manual/examples/resources/images/cubemaps/computer-history-museum/pos-z.jpg',
			'https://threejs.org/manual/examples/resources/images/cubemaps/computer-history-museum/neg-z.jpg',
		] );
		scene.background = texture;

	}

	const loader = new THREE.TextureLoader();
	loader.load( 'emerald.jpg', ( texture ) => {

		texture.colorSpace = THREE.SRGBColorSpace;
		/*
		const material = new THREE.MeshBasicMaterial( {
			map: texture,
		} );
		*/
		const material = new THREE.MeshPhongMaterial( { map: texture } );

		const cube = new THREE.Mesh( geometry, material );
		scene.add( cube );
		//cube.position.x = 2;
		cubes.push( cube ); // add to our list of cubes to rotate

	} );

	const mtlLoader = new MTLLoader();
	mtlLoader.load( 'office_desk.mtl', ( mtl ) => {

		mtl.preload();
		const objLoader = new OBJLoader();
		objLoader.setMaterials( mtl );
		objLoader.load( 'office_desk.obj', ( root ) => {
			// Scale the model down (or up)
			root.scale.set(0.75, 0.75, 0.75);  // adjust as needed

			// Move the model to a better position
			root.position.set(0, -2.45, -2.3);

			scene.add( root );

		} );

	} );

	// === STICK FIGURE GROUP ===
	const stickFigureGroup = new THREE.Group();
	scene.add(stickFigureGroup);

	// === HELPER FUNCTIONS ===

	// Random position at least 4 units away from origin on x,z plane
	function randomPosition4UnitsAway() {
	const radius = 4 + Math.random() * 6; // between 4 and 10 units away
	const angle = Math.random() * Math.PI * 2;
	return {
		x: Math.cos(angle) * radius,
		z: Math.sin(angle) * radius
	};
	}

	// Random bright color
	function randomColor() {
	return new THREE.Color().setHSL(Math.random(), 0.7, 0.5);
	}

	// === CREATE STICK FIGURE FUNCTION ===
	function createStickFigure(x, z, color) {
	const group = new THREE.Group();

	// Head
	const headGeo = new THREE.SphereGeometry(0.2, 16, 16);
	const headMat = new THREE.MeshPhongMaterial({ color });
	const head = new THREE.Mesh(headGeo, headMat);
	head.position.set(0, 1.6, 0);
	group.add(head);

	// Body
	const bodyGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.8);
	const bodyMat = new THREE.MeshPhongMaterial({ color });
	const body = new THREE.Mesh(bodyGeo, bodyMat);
	body.position.set(0, 1.0, 0);
	group.add(body);

	// Left Arm
	const armGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.6);
	const leftArmMat = new THREE.MeshPhongMaterial({ color });
	const leftArm = new THREE.Mesh(armGeo, leftArmMat);
	leftArm.position.set(-0.25, 1.3, 0);
	leftArm.rotation.z = Math.PI / 4;
	group.add(leftArm);

	// Right Arm
	const rightArmMat = new THREE.MeshPhongMaterial({ color });
	const rightArm = new THREE.Mesh(armGeo, rightArmMat);
	rightArm.position.set(0.25, 1.3, 0);
	rightArm.rotation.z = -Math.PI / 4;
	group.add(rightArm);

	// Left Leg
	const legGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.7);
	const leftLegMat = new THREE.MeshPhongMaterial({ color });
	const leftLeg = new THREE.Mesh(legGeo, leftLegMat);
	leftLeg.position.set(-0.15, 0.3, 0);
	leftLeg.rotation.z = -Math.PI / 12;
	group.add(leftLeg);

	// Right Leg
	const rightLegMat = new THREE.MeshPhongMaterial({ color });
	const rightLeg = new THREE.Mesh(legGeo, rightLegMat);
	rightLeg.position.set(0.15, 0.3, 0);
	rightLeg.rotation.z = Math.PI / 12;
	group.add(rightLeg);

	// Position the entire figure
	group.position.set(x, -1.47, z);

	// Add group to stick figure group in scene
	stickFigureGroup.add(group);

	// Return references and animation params for use in animation
	return {
		group,
		headMat,
		bodyMat,
		leftArm,
		rightArm,
		leftLeg,
		rightLeg,
		armSpeed: Math.random() * 2 + 1,    // speed for arms swinging
		legSpeed: Math.random() * 2 + 1.5,  // speed for legs swinging
		colorPhase: Math.random() * Math.PI * 2, // starting phase for color cycling
	};
	}

	// === CREATE AND STORE ALL DANCING FIGURES ===
	const dancingFigures = [];

	for (let i = 0; i < 25; i++) {
	const pos = randomPosition4UnitsAway();
	const color = randomColor();
	const figure = createStickFigure(pos.x, pos.z, color);
	dancingFigures.push(figure);
	}


	function render( time ) {

		time *= 0.001; // convert time to seconds

		cubes.forEach( ( cube, ndx ) => {

			const speed = .5 + ndx * .1;
			const rot = time * speed;
			cube.rotation.x = rot;
			cube.rotation.y = rot;

		} );

		// Animate stick figures
		dancingFigures.forEach(fig => {
			// Arms swing back and forth with sine wave
			const armAngle = Math.sin(time * fig.armSpeed) * 0.7;
			fig.leftArm.rotation.z = Math.PI / 4 + armAngle;
			fig.rightArm.rotation.z = -Math.PI / 4 - armAngle;

			// Legs swing out of phase with arms
			const legAngle = Math.sin(time * fig.legSpeed + Math.PI) * 0.5;
			fig.leftLeg.rotation.z = -Math.PI / 12 + legAngle;
			fig.rightLeg.rotation.z = Math.PI / 12 - legAngle;
			/*
			// Update color cycling over time
			fig.colorPhase += 0.01;
			const h = (fig.colorPhase % (Math.PI * 2)) / (Math.PI * 2);
			const newColor = new THREE.Color().setHSL(h, 0.7, 0.5);

			// Apply new color to all figure parts
			fig.headMat.color.copy(newColor);
			fig.bodyMat.color.copy(newColor);
			fig.leftArm.material.color.copy(newColor);
			fig.rightArm.material.color.copy(newColor);
			fig.leftLeg.material.color.copy(newColor);
			fig.rightLeg.material.color.copy(newColor);
			*/
		});

		renderer.render( scene, camera );

		requestAnimationFrame( render );

	}

	requestAnimationFrame( render );

}

main();
