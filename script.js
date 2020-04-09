var dimX, dimY, dimZ, canvas;


document.addEventListener("DOMContentLoaded", (event) => {

	dimX = document.getElementById("dimensions-x");
	dimY = document.getElementById("dimensions-y");
	dimZ = document.getElementById("dimensions-z");
	canvas = document.getElementById("visualiser");

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

	roomVisualiser();

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
	roomVisualiser()

}


// Constants and variables for canvas stuff
const canvasWidth = 600;
const canvasHeight = 400;

var wallWidth = 300;
var wallHeight = 200;
var roomDepth = 500;

// Draw a representation of the room to the canvas
function roomVisualiser() {

	var ctx = canvas.getContext("2d");
	resFix(ctx);

	var left = (canvasWidth / 2) - (wallWidth / 2);
	var top = 70;

	ctx.beginPath();
	ctx.lineWidth = "1";
	ctx.co
	ctx.rect(left, top, wallWidth, wallHeight);
	ctx.strokeStyle = "#acb9c0";
	ctx.stroke();

	// Use Pythagoras to calculate new offset (depth is hyp, get a and b)

	ctx.beginPath();
	ctx.lineWidth = "1";
	ctx.co
	ctx.rect(left, top, wallWidth, wallHeight);
	ctx.strokeStyle = "#acb9c0";
	ctx.stroke();
}


// Fix blurry drawing on hi res displays
// https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio
function resFix(context) {

	canvas.style.width = canvasWidth + "px";
	canvas.style.height = canvasHeight + "px";

	var scale = window.devicePixelRatio;
	canvas.width = canvasWidth * scale;
	canvas.height = canvasHeight * scale;

	context.scale(scale, scale);

}
