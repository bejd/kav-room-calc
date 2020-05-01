// Functions in this file add listeners to form items which in turn set
// variables which are used by calc.js and visualiser.js.

var dimX, dimY, dimZ;								// Room dimensions
var dialog, optGroup;								// Error dialog
var drawRoom = false;								// Prevent room drawing
var lectPos, pjPos, scrPos;							// Object positions
var lectX, lectY, lectZ;							// Lectern dimensions
var maxViewer = 0, minViewer = 0;					// Viewer distances
var roomMat;										// Wall material
var screenHeight, screenType, screenWidth;			// Screen sizes
var whiteboard;										// Additional equipment


// Add listeners to the various form items. Each input type will call a
// different function to set variables etc. Once all dimensions have been input
// the function to draw the visualiser will be called.
document.addEventListener("DOMContentLoaded", (event) => {
	dialog = document.getElementById("dialog");

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



		// if (input.name == "usage") {
		// 	listenEvent = "click";
		// 	listenFunct = "function() { setUsage(input, input.value); })";
		// }

		// input.addEventListener(listenEvent, listenFunct);




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
				setSize(input, this.id, input.value);
			});
		}

		else if (input.name == "materials") {
			input.addEventListener("click", function() {
				setMaterial(input, input.value);
			});
		}

		else if (input.name == "equip-type") {
			input.addEventListener("click", function() {
				setEquipment(input, input.value);
			});
		}

		else if (input.name == "writing-surface") {
			input.addEventListener("click", function() {
				setWhiteboard(input, input.value);
			});
		}

		else if (input.name == "lect-pos") {
			input.addEventListener("click", function() {
				setLecternPosition(input.value);
			});
		}

		else if (input.id == "displayPosition") {
			scrPos = input.value;
			input.addEventListener("change", function() {
				setDisplayPos(this.value);
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

});


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

// Store room area and volume from user entered dimensions
function setSize(ele, box, val) {
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
		showBox(resultsBox, false);
		clearScene();
		return;
	}

	// Don't calculate volume if Y hasn't been entered
	if (dimY == undefined || dimY == "") {
		document.getElementById("room-volume").innerHTML = "m&sup3;";
		drawRoom = false;
		showBox(resultsBox, false);
		clearScene();
		return;
	}

	unhideItems(ele, 2);

	// Draw the room when all values have been supplied
	if (screenWidth == undefined) setScreenSize(85);
	if (screenType == undefined) setScreenType("pj");
	drawRoom = true;

	calculateRoom();
	renderRoom();

	if (whiteboard == undefined) return;
	showBox(resultsBox, true);
}


// Set the wall material
function setMaterial(ele, mat) {
	roomMat = mat;

	unhideItems(ele, 2);

	// If any dimension values are yet to be filled, don't draw the scene
	if (drawRoom == false) return;
	calculateRoom();
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

	unhideItems(ele, 2);

	if (drawRoom == false) return;
	renderRoom();
}


// Does the user want a whiteboard
function setWhiteboard(ele, sel) {
	whiteboard = sel;

	unhideItems(ele, 5);

	// Draw the room and show the results box when the form has been completed
	if (drawRoom == false) return;

	renderRoom();
	showBox(resultsBox, true);
}


// Set the lectern position
function setLecternPosition(pos) {
	lectPos = pos;

	if (drawRoom == false) return;
	renderRoom();
}


// Redraw the room when projector distance slider changes
function setDisplayPos(value) {
	scrPos = value;

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
