// Create and render a 3D visualisation using three.js. Parameters are based on
// user form input from form.js, and values returned from the Python script via
// calc.js.

var cameraAngle;									// Camera angle
var canvasHeight, canvasWidth;						// Canvas parameters
var renderer, scene, visualiser;					// Main visualiser bits


// When the page has loaded add functions to the camera view buttons and call
// the function to create the three.js scene
document.addEventListener("DOMContentLoaded", (event) => {
	var buttons = Array.from(document.getElementsByClassName("cam-buttons")[0].children);
	buttons.forEach(button => {

		button.addEventListener("click", function() {
			setCamAngle(button.value);
		});

	});

	createScene();
});


// Set the camera angle
function setCamAngle(angle) {
	cameraAngle = angle;

	if (drawRoom == false) return;
	renderRoom();
}



//Create the three.js renderer and scene
function createScene() {
	visualiser = document.getElementById("visualiser");

	renderer = new THREE.WebGLRenderer( { alpha: true, antialias: true } );
	scene = new THREE.Scene();

	canvasWidth = visualiser.clientWidth;
	canvasHeight = visualiser.clientHeight;

	// Setup scene and renderer and add to the DOM
	renderer.setSize(canvasWidth, canvasHeight);
	renderer.setPixelRatio( window.devicePixelRatio ); // fix for HiDPI displays
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;

	visualiser.appendChild(renderer.domElement);
}


// Update the room visualisation
function renderRoom() {
	const wallWidth = Number(dimX);
	const wallHeight = Number(dimY);
	const roomDepth = Number(dimZ);
	var savedPosition;

	// First, remove any other objects
	clearScene();

	// Create a cube with material on the inside only, gives the
	// effect of looking through outer walls to inside of room
	var geometry = new THREE.BoxBufferGeometry( wallWidth, wallHeight, roomDepth );
	var material = new THREE.MeshStandardMaterial( { color: 0xcdd7dc, side: THREE.BackSide } );
	var mesh = new THREE.Mesh( geometry, material );

	scene.add(mesh);

	// Draw identical cube but with a shadow receiving material
	material = new THREE.ShadowMaterial( { side: THREE.BackSide } );
	material.opacity = 0.05;
	mesh = new THREE.Mesh( geometry, material );
	mesh.receiveShadow = true;

	scene.add(mesh);


	// Draw display if one has been selected
	if (screenType != undefined) {

		// Calculate X offset for later
		var wallPos = (wallWidth / -2) + (wallWidth * (scrPos / 100));

		// Convert percentage to range
		const rngLow = -100;
		const rngHigh = 100;
		const scrOffset = rngLow + (scrPos * (rngHigh - rngLow) / 100);

		wallPos += (screenWidth / -2) * (scrOffset / 100);


		// Make a dark screen for a TV
		if (screenType == "tv") {
			screenColor = 0x757f86;
			screenThick = 0.07;
		}

		// Make a light screen and box for a projector
		else if (screenType == "pj") {
			screenColor = 0xffffff;
			screenThick = 0.02;

			// Draw the projector
			geometry = new THREE.BoxBufferGeometry( 0.498, 0.168, 0.492 ); // PT-RZ570
			material = new THREE.MeshStandardMaterial( { color: 0x757f86 } );
			mesh = new THREE.Mesh( geometry, material );

			// Initially position projector to ceiling and front of room
			mesh.position.y = (wallHeight / 2) - (0.2 / 2);
			mesh.position.z = (roomDepth / -2) + (0.5 / 2);

			// Offset Z position
			var pjCeilingDist = 0.1;
			var pjMaxDist = roomDepth - 0.5;
			var pjScreenDist = pjMaxDist * (1 / (100 / -(pjPos - 100)));

			mesh.position.x = wallPos;
			mesh.position.y -= pjCeilingDist;
			mesh.position.z += pjScreenDist;
			mesh.castShadow = true;

			scene.add(mesh);
		}

		// The wall mounted screen
		geometry = new THREE.BoxBufferGeometry(
			screenWidth,
			screenHeight,
			screenThick
		);
		material = new THREE.MeshStandardMaterial( { color: screenColor } );
		mesh = new THREE.Mesh( geometry, material );

		mesh.position.x = wallPos;
		mesh.position.y = wallHeight / 10;
		mesh.position.z = (roomDepth / -2) + 0.05;

		mesh.castShadow = true;

		savedPosition = mesh.position;
		scene.add(mesh);

		// For shadows on the display
		material = new THREE.ShadowMaterial();
		material.opacity = 0.05;
		mesh = new THREE.Mesh (geometry, material);

		mesh.position.set(savedPosition.x, savedPosition.y, savedPosition.z);
		mesh.receiveShadow = true;

		scene.add(mesh);

	}


	// Draw a lectern
	geometry = new THREE.BoxBufferGeometry( lectX, lectY, lectZ );
	material = new THREE.MeshStandardMaterial( { color: 0xa1312b } );
	mesh = new THREE.Mesh ( geometry, material );

	// Move lectern to front of room
	var sittingGap = 0.7;
	mesh.position.y = (wallHeight / -2) + (lectY / 2);
	mesh.position.z = (roomDepth / -2) + (lectZ / 2) + sittingGap;

	// Position left or right
	var wallGap = 0.1;
	if (lectPos == undefined || lectPos == "left") {
		mesh.position.x = (wallWidth / -2) + (lectX / 2) + wallGap;
	}
	else if (lectPos == "right") {
		mesh.position.x = (wallWidth / 2) - (lectX / 2) - wallGap;
	}
	mesh.castShadow = true;

	savedPosition = mesh.position;
	scene.add(mesh);

	// Shadow receiver
	material = new THREE.ShadowMaterial();
	material.opacity = 0.05;
	mesh = new THREE.Mesh ( geometry, material );

	mesh.position.set(savedPosition.x, savedPosition.y, savedPosition.z);
	mesh.receiveShadow = true;

	scene.add(mesh);


	// Draw plane to visualise viewer distances
	var viewDepth = maxViewer - minViewer;

	// geometry = new THREE.PlaneGeometry( wallWidth - 1, viewDepth, 1, 1 );
	// material = new THREE.MeshStandardMaterial( { color: 0x86757f } );
	// mesh = new THREE.Mesh( geometry, material );

	// mesh.rotateX( -90 * Math.PI / 180);
	// mesh.position.y = (wallHeight / -2) + 0.01;
	// mesh.position.z = - (roomDepth / 2) + (viewDepth / 2) + minViewer;

	// scene.add(mesh);


	// Draw left and right speakers
	geometry = new THREE.BoxBufferGeometry( 0.215, 0.365, 0.215 ); // QSC AD-S6T
	material = new THREE.MeshStandardMaterial( { color: 0x757f86 } );
	mesh = new THREE.Mesh (geometry, material);

	var spkrInset = 0.1;

	mesh.position.x = (wallWidth / -2) + (0.215 / 2) + spkrInset;
	mesh.position.y = (wallHeight / 2) - (0.365 / 2) - spkrInset;
	mesh.position.z = (roomDepth / -2) + (0.215 / 2) + spkrInset;
	mesh.castShadow = true;

	savedPosition = mesh.position;
	scene.add(mesh);

	mesh = new THREE.Mesh( geometry, material );

	mesh.position.set(savedPosition.x, savedPosition.y, savedPosition.z);
	mesh.position.x = (wallWidth / 2) - (0.215 / 2) - spkrInset;
	mesh.castShadow = true;

	scene.add(mesh);


	// Light the scene
	const lightIntensity = 1.5;
	var light = new THREE.DirectionalLight( 0xffffff, lightIntensity );
	light.position.set(1, 1.25, 1.1);
	light.castShadow = true;

	scene.add(light);

	// // Debug lights
	// var helper = new THREE.DirectionalLightHelper(light, 1, 0xb5dde1);
	// scene.add(helper);


	// Camera setup
	var camera = new THREE.OrthographicCamera(
		canvasWidth / -2,
		canvasWidth / 2,
		canvasHeight / 2,
		canvasHeight / -2,
		1,
		1000
	);

	// Move and adjust the camera angle
	if (cameraAngle == undefined || cameraAngle == "iso") {
		camera.position.set(45, 30, 45);
	} else if (cameraAngle == "side") {
		camera.position.set(45, 0, 0);
	} else if (cameraAngle == "top") {
		camera.position.set(0, 30, 0);
	} else if (cameraAngle == "back") {
		camera.position.set(0, 0, 45);
	}

	camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );

	// Zoom camera to fit the diagonal of the room
	var floorDiag = Math.sqrt(Math.pow(wallWidth, 2) + Math.pow(roomDepth, 2));
	camera.zoom = (canvasWidth - 50) / floorDiag;

	camera.updateProjectionMatrix();


	// Render the static scene
	renderer.render(scene, camera);
}


// Remove all objects from the scene so they can be re-drawn
function clearScene() {
	while (scene.children.length > 0) {
		scene.remove(scene.children[0]);
	}
}
