var costBox, cost = 0;										// Estimate costs
var costsDict = {
	"roomSize": 0,
	"display": 0,
	"speakers": 0,
	"lectern": 0
};
var formItems;												// Form display
var dimX, dimY, dimZ;										// Room dimensions
var roomMat;												// Room material

var screenType, screenWidth, screenHeight					// Screen sizes
var pjPos, scrPos;											// Positions
var whiteboard;												// Equipment
var lectX, lectY, lectZ										// Lectern
var lectPos = "left";
var minViewer = 0, maxViewer = 0;							// Viewer distances

var cameraAngle = "iso";									// Camera angle
var visualiser, canvasWidth, canvasHeight, renderer, scene;	// Three.js things
var drawRoom = false;
var dialog, optGroup;										// Dialog things


document.addEventListener("DOMContentLoaded", (event) => {
	formItems = Array.from(document.getElementById("form").children);
	costBox = document.getElementById("cost-estimate");
	dialog = document.getElementById("dialog");
	visualiser = document.getElementById("visualiser");

	// Create the three.js renderer and scene
	createScene();

	// Add class to show initial items. Items will be revealed as form is filled
	// in by calling the unhideItems() function
	formItems.forEach(child => {
		if (formItems.indexOf(child) > 1) {
			// child.style.display = "block";
			child.classList.add("display-none");
			child.classList.add("opacity-zero");
		}
	});

	// Add listeners to the various form items. Each input type will call a
	// different function to set variables etc. Once all dimensions have been
	// input the function to draw the visualiser will be called.
	var inputs = Array.from(document.querySelectorAll("input"));
	inputs.forEach(input => {

		// Separate from the below if/else as can also be set to inputs.
		// Needs to be first as must be called before the below so can prevent
		// normal function.
		if (input.classList.contains("restricted")) {
			input.addEventListener("click", function() {
				showDialog(this.name);
			});
		}

		// If/else for each option in the form
		 if (input.name == "usage") {
			input.addEventListener("click", function() {
				setUsage(input, input.value);
			});
		}

		else if (input.name == "shape") {
			input.addEventListener("click", function() {
				setShape(input, input.value);
			});
		}

		else if (input.name == "dimensions") {
			input.addEventListener("input", function() {
				calcSize(input, this.id, input.value);
			});
		}

		else if (input.name == "materials") {
			input.addEventListener("click", function() {
				setMaterial(input, input.value);
			});
		}

		else if (input.id == "displayPosition") {
			scrPos = input.value;
			input.addEventListener("change", function() {
				setDisplayPos(this.value);
			});
		}

		else if (input.name == "equip-type") {
			input.addEventListener("click", function() {
				setEquipment(input, input.value);
			});
		}

		else if (input.name == "lect-pos") {
			input.addEventListener("click", function() {
				setLecternPosition(input.value);
			});
		}

		else if (input.name == "writing-surface") {
			input.addEventListener("click", function() {
				setWhiteboard(input, input.value);
			});
		}

		else if (input.name == "display") {
			input.addEventListener("click", function() {
				setScreenType(input.value);
			});
		}

		else if (input.name == "tv-size") {
			input.addEventListener("click", function() {
				setScreenSize(input.value);
			});
		}

		else if (input.id == "pjPosition") {
			pjPos = input.value;
			input.addEventListener("change", function() {
				setProjectorPos(this.value);
			});
		}

		else if (input.name == "viewer") {
			input.addEventListener("click", function() {
				setViewerDist(this.id, input.value);
			});
		}

	});

	// Add functions to camera buttons
	var buttons = Array.from(document.getElementsByClassName("cam-buttons")[0].children);
	buttons.forEach(button => {

		button.addEventListener("click", function() {
			setCamAngle(button.value);
		});

	});

	// Uncomment for testing
	// dimX = 8;
	// dimY = 3;
	// dimZ = 5;

	// setEquipment("sml");
	// setScreenType("pj");

	// calcSize();

});


// Get the next elements in the form and add the class to show it
function unhideItems(ele, num) {
	var parent = ele.parentNode.parentNode;
	var start = formItems.indexOf(parent);

	for (var i = 1; i <= num; i++) {
		// Make the element a block/flex/whatever again
		formItems[start + i].classList.remove("display-none");
		// After a delay, fade it in
		setTimeout(
			function (e) {
				e.classList.remove("opacity-zero");
			},
			0,
			formItems[start + i]
		);

	}
}


// Show dialog overlay and set the message based on which selection has caused
// the dialog to be called.
function showDialog(opt) {
	// Store the group for being cleared later
	optGroup = opt;

	// Create a new <p>
	var elem = document.createElement("p");
	var msg;

	// Set the text node on what's calling the dialog
	if (opt == "shape") {
		msg = document.createTextNode(
			"This calculator is designed for rectangular rooms only."
		);
	}
	else if (opt == "usage") {
		msg = document.createTextNode(
			"This calculator is designed for basic uses only."
		);
	}

	elem.appendChild(msg);

	// Add the new <p> as first child of the dialog flex
	var dialogFlex = document.getElementById("dialog-flex");
	dialogFlex.insertAdjacentElement("afterbegin", elem);

	dialog.show();
}


// Hide the dialog and reset things
function hideDialog() {
	// Remove the <p> set by showDialog
	var dialogFlex = document.getElementById("dialog-flex");
	dialogFlex.removeChild(dialogFlex.childNodes[0]);

	// Deselect any the flagged option
	var options = Array.from(document.querySelectorAll("input[name = '" + optGroup + "']"));
	options.forEach(option => option.checked = false);

	dialog.close();
}


// Send an email using default program on button click
function sendEmail() {
	var link = "mailto:rodrigo.sanchez-pizani@kcl.ac.uk"
			 + "?subject=Make me a room, Rodders";

	window.open(link);

	hideDialog();
}


// Set room usage, ensure nothing extravagent
function setUsage(ele, use) {
	if (dialog.open) return;

	unhideItems(ele, 2);
}


// Ensure room shape has been set to rectangular
function setShape(ele, shape) {
	if (dialog.open) return;

	unhideItems(ele, 2)

}

// Calculate room area and volume from user entered dimensions
function calcSize(ele, box, val) {
	// Store box values
	if (box == "dimensions-x") {
		dimX = val;
	}
	else if (box == "dimensions-y") {
		dimY = val;
	}
	else if (box == "dimensions-z") {
		dimZ = val;
	}

	// Make sure X and Z have been entered correctly
	if (dimX == undefined || dimX == "" || dimZ== undefined || dimZ == "") {
		// Otherwise clear
		document.getElementById("floor-area").innerHTML = "m&sup2;";
		document.getElementById("room-volume").innerHTML = "m&sup3;";
		document.getElementById("capacity").innerHTML = "";
		drawRoom = false;
		showVisualiser(false);
		clearScene();
		return;
	}

	// Don't calculate volume if Y hasn't been entered
	if (dimY == undefined || dimY == "") {
		document.getElementById("room-volume").innerHTML = "m&sup3;";
		drawRoom = false;
		showVisualiser(false);
		clearScene();
		return;
	}

	unhideItems(ele, 2);

	// Draw the room when all values have been supplied
	calculateRoom();

	if (screenWidth == undefined) setScreenSize(55);

	drawRoom = true;
	renderRoom();
	showVisualiser(true);
}


// Set the wall material
function setMaterial(ele, mat) {
	roomMat = mat;

	unhideItems(ele, 10);

	if (drawRoom == false) return;
	calculateRoom();
	renderRoom();
}


// Redraw the room when projector distance slider changes
function setDisplayPos(value) {
	scrPos = value;

	if (drawRoom == false) return;
	renderRoom();
}


// Set the lectern size
function setEquipment(ele, size) {
	if (size == "sml") {
		lectX = 1.200;
		lectY = 1.022;
		lectZ = 0.700;
		calculateCost("lectern", 3984.29);
	}

	else if (size = "lrg") {
		lectX = 1.810;
		lectY = 1.000;
		lectZ = 0.700;
		calculateCost("lectern", 5345.71);
	}

	unhideItems(ele, 5);

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


// Does the user want a whiteboard
function setWhiteboard(ele, sel) {
	whiteboard = sel;

	// If any dimension values are yet to be filled, don't draw the scene
	if (drawRoom == false) return;
	renderRoom();
}


// Set the screen type
function setScreenType(type) {
	screenType = type;

	// Temp set testing costs
	if (screenType == "pj") {
		calculateCost("display", 2670);
	}

	if (drawRoom == false) return;
	renderRoom();
}


// Set the screen size
function setScreenSize(diag) {
	// Temp set testing costs
	var scrCost = 0;
	if (screenType == "pj") {
		scrCost = 2670;
	}
	else if (screenType == "tv") {
		if (diag == "55") {
			scrCost = 1000;
		}
		else if (diag == "65") {
			scrCost = 1554;
		}
		else if (diag == "75") {
			scrCost = 2194;
		}
		else if (diag == "85") {
			scrCost = 3867;
		}
		else if (diag == "98") {
			scrCost = 11334;
		}
	}
	calculateCost("display", scrCost);

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
function setProjectorPos(value) {
	pjPos = value;

	if (drawRoom == false) return;
	renderRoom();
}


// Store variables for minimum/maximum viewer distances
function setViewerDist(box, dist) {
	if (box == "min-viewer") {
		minViewer = dist;
	}
	else if (box == "max-viewer") {
		maxViewer = dist;
	}

	if (drawRoom == false) return;
	renderRoom();
}


// Set the camera angle
function setCamAngle(angle) {
	cameraAngle = angle;

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
	const wallWidth = Number(dimX);
	const wallHeight = Number(dimY);
	const roomDepth = Number(dimZ);
	var savedPosition;

	// First, remove any other objects
	clearScene();

	// Create a cube with material on the inside only, gives the
	// effect of looking through outer walls to inside of room
	var geometry = new THREE.BoxBufferGeometry( wallWidth, wallHeight, roomDepth );
	var material = new THREE.MeshStandardMaterial( { color: 0xf0f1f2, side: THREE.BackSide } );
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
	material = new THREE.MeshStandardMaterial( { color: 0x868375 } );
	mesh = new THREE.Mesh ( geometry, material );

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
	if (cameraAngle == "iso") {
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


// Show or hide the visualiser
function showVisualiser(opt) {
	if (opt) {
		visualiser.classList.add("right-side");
	}

	else if (!opt) {
		visualiser.classList.remove("right-side");
	}

}


// Update the displayed cost by reading the costs object
function calculateCost(key, value) {
	costsDict[key] = value;
	cost = 0;

	for (let [key, value] of Object.entries(costsDict)) {
		cost += value;
	}

	costBox.innerHTML = cost.toLocaleString();
}


// Create an asynchronous request to the server, sending the user form data.
// The PHP server in turn passes the values to a Python script. The response
// returned is a JSON string which is parsed before being passed to the
// setRoomData which reads the dictionary and processes the data
function calculateRoom() {
	var requestObj = new XMLHttpRequest();

	// What to do when receiving the response to the below
	requestObj.onload = function() {
		setRoomData(JSON.parse(this.response));
		console.log(JSON.parse(this.response));
	};

	requestObj.open(
		"get",
		"calc.php?x=" + dimX
			  + "&y=" + dimY
			  + "&z=" + dimZ
			  + "&m=" + roomMat,
		true
	);
	requestObj.send();
}


// Process the data received from the calculateRoom function
function setRoomData(roomData) {
	var area = roomData["area"];
	document.getElementById("floor-area").innerHTML = +area.toFixed(2) + "m&sup2;";

	var volume = roomData["volume"];
	document.getElementById("room-volume").innerHTML = +volume.toFixed(2) + "m&sup3;";

	var capacity = roomData["capacity"];
	document.getElementById("capacity").innerHTML = capacity.toFixed(0) + " people";

	var costPerSqM = 1000;
	calculateCost("roomSize", area * costPerSqM);
}
