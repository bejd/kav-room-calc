var dimX, dimY, dimZ;										// Room variables
var screenType, screenWidth, screenHeight					// Screen sizes
var pjPos, dspPos;											// Positions
var lectX, lectY, lectZ										// Lectern
var lectPos = "left";
var visualiser, canvasWidth, canvasHeight, renderer, scene;	// Three.js things
var drawRoom = false;


document.addEventListener("DOMContentLoaded", (event) => {

	dimX = document.getElementById("dimensions-x");
	dimY = document.getElementById("dimensions-y");
	dimZ = document.getElementById("dimensions-z");
	pjPos = document.getElementById("pjPosition");
	dspPos = document.getElementById("displayPosition");

	visualiser = document.getElementById("visualiser");

	// Listen for changes to the dimension boxes
	dimX.addEventListener("input", function() {
		calcSize();
	});

	dimY.addEventListener("input", function() {
		calcSize();
	});

	dimZ.addEventListener("input", function() {
		calcSize();
	});

	// Listen for changes to radio buttons
	var options = Array.from(document.querySelectorAll("input[name = 'lect-pos']"));
	options.forEach(option => {
		option.addEventListener("click", function() {
			setLecternPosition(option.value);
		});
	});

	options = Array.from(document.querySelectorAll("input[name = 'lect-size']"));
	options.forEach(option => {
		option.addEventListener("click", function() {
			setLecternSize(option.value);
		});
	});

	options = Array.from(document.querySelectorAll("input[name = 'display']"));
	options.forEach(option => {
		option.addEventListener("click", function() {
			setScreenType(option.value);
		});
	});

	options = Array.from(document.querySelectorAll("input[name = 'tv-size']"));
	options.forEach(option => {
		option.addEventListener("click", function() {
			setScreenSize(option.value);
		});
	});

	pjPos.addEventListener("change", function() {
		setProjectorPos();
	});

	dspPos.addEventListener("change", function() {
		setDisplayPos();
	});

	// Create the three.js renderer and scene
	createScene()

	// Uncomment for testing
	// dimX.value = 5;
	// dimY.value = 4;
	// dimZ.value = 2;

	// setLecternSize("sml");
	// setScreenType("pj");

	// calcSize();

});


// Calculate room area and volume from user entered dimensions
function calcSize() {
	// Make sure X and Y have been entered correctly
	if (dimX.value == "" || dimY.value == "" ) {
		// Otherwise clear
		document.getElementById("floor-area").innerHTML = "";
		document.getElementById("room-volume").innerHTML = "";
		drawRoom = false;
		clearScene();
		return;
	}

	var area = dimX.value * dimY.value;
	document.getElementById("floor-area").innerHTML = area + "m&sup2;";

	// Don't calculate volume if Z hasn't been entered
	if (dimZ.value == "") {
		document.getElementById("room-volume").innerHTML = "";
		drawRoom = false;
		clearScene();
		return;
	}

	var volume = area * dimZ.value;
	document.getElementById("room-volume").innerHTML = volume + "m&sup3;";

	// Draw the room when all values have been supplied
	drawRoom = true;
	if (screenWidth == undefined) setScreenSize(55);
	renderRoom();
}


// Set the lectern size
function setLecternSize(size) {
	if (size == "sml") {
		lectX = 1.200;
		lectY = 1.022;
		lectZ = 0.700;
	}

	else if (size = "lrg") {
		lectX = 1.810;
		lectY = 1.000;
		lectZ = 0.700;
	}

	// If any dimension values are yet to be filled, don't draw the scene
	if (drawRoom == false) return;
	renderRoom();
}


// Set the lectern position
function setLecternPosition(pos) {
	lectPos = pos;

	if (drawRoom == false) return;
	renderRoom();
}


// Set the screen type
function setScreenType(type) {
	screenType = type;

	if (drawRoom == false) return;
	renderRoom();
}


// Set the screen size
function setScreenSize(diag) {
	//Convert inches to metres
	diag = diag * 0.0254;

	// Find width and height from diagonal and aspect ratio
	var aRWdth = 16;
	var aRHght = 9;
	var aRDiag = Math.sqrt(Math.pow(aRWdth, 2) + Math.pow(aRHght, 2));

	var factor = diag / aRDiag;

	screenWidth = aRWdth * factor;
	screenHeight = aRHght * factor;

	// If any dimension values are yet to be filled, don't draw the scene
	if (drawRoom == false) return;
	renderRoom();
}


// Redraw the room when projector distance slider changes
function setProjectorPos() {
	if (drawRoom == false) return;
	renderRoom();
}


// Redraw the room when projector distance slider changes
function setDisplayPos() {
	if (drawRoom == false) return;
	renderRoom();
}


//Create the three.js renderer and scene
function createScene() {
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
	const wallWidth = Number(dimX.value);
	const wallHeight = Number(dimZ.value);
	const roomDepth = Number(dimY.value);
	var savedPosition;

	// First, remove any other objects
	clearScene();

	// Create a cube with material on the inside only, gives the
	// effect of looking through outer walls to inside of room
	var geometry = new THREE.BoxBufferGeometry(wallWidth, wallHeight, roomDepth);
	var material = new THREE.MeshStandardMaterial ( { color: 0xf0f1f2, side: THREE.BackSide } );
	var mesh = new THREE.Mesh (geometry, material);

	scene.add(mesh);

	// Draw identical cube but with a shadow receiving material
	material = new THREE.ShadowMaterial( { side: THREE.BackSide } );
	material.opacity = 0.05;
	mesh = new THREE.Mesh (geometry, material);
	mesh.receiveShadow = true;

	scene.add(mesh);


	// Draw display if one has been selected
	if (screenType != undefined) {
		// Calculate X offset for later
		var wallPos = (wallWidth / -2) + (wallWidth * (dspPos.value / 100));

		if (dspPos.value < 50) {
			wallPos += (screenWidth / 2) * ((100 - dspPos.value) / 100);
		} else if (dspPos.value > 50) {
			wallPos -= (screenWidth / 2) * (dspPos.value / 100);
		}

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
			geometry = new THREE.BoxBufferGeometry( 0.8, 0.2, 0.5 );
			material = new THREE.MeshStandardMaterial ( { color: 0x757f86 } );
			mesh = new THREE.Mesh (geometry, material);

			// Initially position projector to ceiling and front of room
			mesh.position.y = (wallHeight / 2) - (0.2 / 2);
			mesh.position.z = (roomDepth / -2) + (0.5 / 2);

			// Offset Z position
			var pjCeilingDist = 0.1;
			var pjMaxDist = roomDepth - 0.5;
			var pjScreenDist = pjMaxDist * (1 / (100 / -(pjPos.value - 100)));

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
		material = new THREE.MeshStandardMaterial ( { color: screenColor } );
		mesh = new THREE.Mesh (geometry, material);

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
	material = new THREE.MeshStandardMaterial ( { color: 0x868375 } );
	mesh = new THREE.Mesh (geometry, material);

	// Move lectern to front of room
	var sittingGap = 0.7;
	mesh.position.y = (wallHeight / -2) + (lectY / 2);
	mesh.position.z = (roomDepth / -2) + (lectZ / 2) + sittingGap;

	// Position left or right
	var wallGap = 0.1;
	if (lectPos == "left") {
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
	mesh = new THREE.Mesh (geometry, material);

	mesh.position.set(savedPosition.x, savedPosition.y, savedPosition.z);
	mesh.receiveShadow = true;

	scene.add(mesh);


	// Light the scene
	const lightIntensity = 1.5;
	var light = new THREE.DirectionalLight(0xffffff, lightIntensity);
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
	camera.position.x = 45;
	camera.position.y = 30;
	camera.position.z = 45;

	camera.lookAt( new THREE.Vector3(0, 0, 0) );

	// Zoom camera to fit the diagonal of the room
	var floorDiag = Math.sqrt(Math.pow(wallWidth, 2) + Math.pow(roomDepth, 2));
	camera.zoom = (canvasWidth - 50) / floorDiag;

	camera.updateProjectionMatrix();


	// Render the static scene
	renderer.render(scene, camera);
}


function clearScene() {
	while (scene.children.length > 0) {
		scene.remove(scene.children[0]);
	}
}
