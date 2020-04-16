var dimX, dimY, dimZ, visualiser;


document.addEventListener("DOMContentLoaded", (event) => {

	dimX = document.getElementById("dimensions-x");
	dimY = document.getElementById("dimensions-y");
	dimZ = document.getElementById("dimensions-z");
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

	// dimX.value = 4; // quick testing
	// dimY.value = 4; // quick testing
	// dimZ.value = 2; // quick testing

	// roomVisualiser(); // quick testing

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
	var canvasWidth = visualiser.clientWidth;
	var canvasHeight = visualiser.clientHeight;
	var wallWidth = Number(dimX.value);
	var wallHeight = Number(dimZ.value);
	var roomDepth = Number(dimY.value);

	// Setup scene, camera, renderer and add to the DOM
	var scene = new THREE.Scene();
	scene.fog = new THREE.Fog(0xffffff, 10, 30);

	var renderer = new THREE.WebGLRenderer( { alpha: true, antialias: true });
	renderer.setSize(canvasWidth, canvasHeight);
	visualiser.appendChild(renderer.domElement);

	var camera = new THREE.OrthographicCamera(
		canvasWidth / -2,
		canvasWidth / 2,
		canvasHeight / 2,
		canvasHeight / -2,
		1,
		1000
	);

	// Get the room size and draw the room
	var room = new THREE.BoxBufferGeometry(wallWidth, wallHeight, roomDepth);
	var edges = new THREE.EdgesGeometry(room);
	var material = new THREE.LineBasicMaterial( { color: 0x899197} );
	var wireframe = new THREE.LineSegments(edges, material);

	scene.add(wireframe);

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
	camera.position.x = 10;
	camera.position.y = 10;
	camera.position.z = 10;

	camera.lookAt( new THREE.Vector3(0, 0, 0) );

	// Render the static scene
	// Uncomment lines if animation updating is needed

	// function animate() {
		// requestAnimationFrame(animate);
		renderer.render(scene, camera);
	// }

	// animate();

}
