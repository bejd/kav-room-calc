var dimX, dimY, dimZ, display, visualiser;


document.addEventListener("DOMContentLoaded", (event) => {

	dimX = document.getElementById("dimensions-x");
	dimY = document.getElementById("dimensions-y");
	dimZ = document.getElementById("dimensions-z");
	visualiser = document.getElementById("visualiser");
	display = document.getElementById("display");

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

	dimX.value = 4; // quick testing
	dimY.value = 4; // quick testing
	dimZ.value = 2; // quick testing

	calcSize(); // quick testing

});


// Calculate room area and volume from user entered dimensions
function calcSize() {

	// Make sure X and Y have been entered correctly
	if (dimX.value == "" || dimY.value == "" ) {
		// Otherwise clear
		document.getElementById("floor-area").innerHTML = "";
		document.getElementById("room-volume").innerHTML = "";
		return;
	}

	var area = dimX.value * dimY.value;
	document.getElementById("floor-area").innerHTML = area + "m&sup2;";

	// Don't calculate volume if Z hasn't been entered
	if (dimZ.value == "") {
		document.getElementById("room-volume").innerHTML = "";
		return;
	}

	var volume = area * dimZ.value;
	document.getElementById("room-volume").innerHTML = volume + "m&sup3;";

	// Draw the room when all values have been supplied
	clearVis();
	roomVisualiser();

}


// When the room values are changed, remove the
// current visualiser before adding a new one
function clearVis() {
	var visChild = Array.from(visualiser.children);

	visChild.forEach(child => {
		child.remove();
	});
}


// Draw a representation of the room to the canvas
function roomVisualiser() {
	const canvasWidth = visualiser.clientWidth;
	const canvasHeight = visualiser.clientHeight;
	const wallWidth = Number(dimX.value);
	const wallHeight = Number(dimZ.value);
	const roomDepth = Number(dimY.value);

	// Setup scene and renderer and add to the DOM
	const scene = new THREE.Scene();

	const renderer = new THREE.WebGLRenderer( { alpha: true, antialias: true } );
	renderer.setSize(canvasWidth, canvasHeight);
	renderer.setPixelRatio( window.devicePixelRatio ); // fix for HiDPI displays

	visualiser.appendChild(renderer.domElement);

	// // Room wireframe
	// var geometry = new THREE.BoxBufferGeometry(wallWidth, wallHeight, roomDepth);
	// var edges = new THREE.EdgesGeometry(geometry);
	// var material = new THREE.LineBasicMaterial( { color: 0x899197} );
	// var wireframe = new THREE.LineSegments(edges, material);

	// scene.add(wireframe);

	// Back wall
	var geometry = new THREE.PlaneGeometry(wallWidth, wallHeight);
	var material = new THREE.MeshStandardMaterial ( { color: 0xf0f1f2 } );
	var mesh = new THREE.Mesh (geometry, material);

	mesh.position.z = roomDepth / -2;

	scene.add(mesh);

	// Side wall
	geometry = new THREE.PlaneGeometry(roomDepth, wallHeight);
	mesh = new THREE.Mesh (geometry, material);

	mesh.position.x = wallWidth / -2;
	mesh.rotateY(90 * Math.PI / 180);

	scene.add(mesh);

	// Floor
	geometry = new THREE.PlaneGeometry(wallWidth, roomDepth);
	// material = new THREE.MeshStandardMaterial ( { color: 0xb9bec2 } );
	mesh = new THREE.Mesh (geometry, material);

	mesh.position.y = wallHeight / -2;
	mesh.rotateX(-90 * Math.PI / 180);

	scene.add(mesh);

	// Display
	const aspect = 1.78;
	geometry = new THREE.BoxBufferGeometry((wallHeight / 2) * aspect, (wallHeight / 2), 0.05)
	material = new THREE.MeshStandardMaterial ( { color: 0x757f86 } );
	mesh = new THREE.Mesh (geometry, material);

	mesh.position.z = (roomDepth / -2) + 0.05;
	mesh.position.y = wallHeight / 10;

	scene.add(mesh);

	// Light the scene
	const intensity = 1.5;
	const light = new THREE.DirectionalLight(0xffffff, intensity);
	light.position.set(1, 1.25, 1.1);

	scene.add(light)

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

	// Zoom the camera to fit the room based on the longest edge
	if (wallWidth > wallHeight && wallWidth > roomDepth) {
		camera.zoom = canvasWidth / (wallWidth * 2);
	} else if (roomDepth > wallHeight) {
		camera.zoom = canvasWidth / (roomDepth * 2);
	} else {
		camera.zoom = canvasHeight / (wallHeight * 2);
	}

	camera.updateProjectionMatrix();

	// Move and adjust the camera angle
	camera.position.x = 45;
	camera.position.y = 30;
	camera.position.z = 45;

	camera.lookAt( new THREE.Vector3(0, 0, 0) );

	// Render the static scene
	// Uncomment lines if animation updating is needed

	// function animate() {
		// requestAnimationFrame(animate);
		renderer.render(scene, camera);
	// }

	// animate();

}
