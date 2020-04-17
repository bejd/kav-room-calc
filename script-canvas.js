var dimX, dimY, dimZ, visualiser;
var canvasWidth, canvasHeight;


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

	dimX.value = 4; // quick testing
	dimY.value = 4; // quick testing
	dimZ.value = 4; // quick testing

	roomVisualiser(); // quick testing

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
	roomVisualiser();

}


// Draw a representation of the room to the canvas
function roomVisualiser() {
	canvasWidth = 600;
	canvasHeight = 400;
	const wallWidth = Number(dimX.value) * 100;
	const wallHeight = Number(dimZ.value) * 100;
	const roomDepth = Number(dimY.value) * 100;

	var ctx = canvas.getContext("2d");
	resFix(ctx);

	// var left = (canvasWidth / 2) - (wallWidth / 2);
	var left =0;
	// var top = 70;
	var top = 0;


	// Floor
	ctx.setTransform(1, 0.5, -1, 0.5, 450, 200); // Skews the rectangle for isometric illusion
	ctx.beginPath();
	ctx.rect(left, top, wallWidth, roomDepth);
	ctx.fillStyle = "#acb9c0";
	ctx.fill();

	// Back wall
	ctx.setTransform(1, 0.5, 0, 1, wallWidth, wallHeight);
	ctx.beginPath();
	ctx.rect(left + 50, top + 50, wallWidth, wallHeight);
	ctx.fillStyle = "#899197";
	ctx.fill();

	// Side wall
	ctx.setTransform(1, -0.5, 0, 1, 0, -24);
	ctx.beginPath();
	ctx.rect(left + 50, top + 50, roomDepth, wallHeight);
	ctx.fillStyle = "#aab0b4";
	ctx.fill();

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
