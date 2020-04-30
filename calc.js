// Pass variables retrieved from the user form to the PHP and process the
// returned data.

var cost = 0;										// Total cost
var costBox;
var costsDict = {};									// Individual item costs



document.addEventListener("DOMContentLoaded", (event) => {
	costBox = document.getElementById("cost-box");
});


// Add new entries to the costs dictionary, then total the values and display
// the total estimated cost to the user.
function calculateCost(key, value) {
	costsDict[key] = value;
	cost = 0;

	for (let [key, value] of Object.entries(costsDict)) {
		cost += value;
	}

	document.getElementById("cost-estimate").innerHTML =
		"Estimated cost: £"
		+ cost.toLocaleString();
}


// Create an asynchronous request to the server, sending the user form data.
// The PHP server in turn passes the values to a Python script. The response
// returned is a JSON string which is parsed before being passed to the
// setRoomData function which reads the dictionary and processes the data.
function calculateRoom() {
	var requestObj = new XMLHttpRequest();

	// What to do when receiving a response to the below
	requestObj.onload = function() {
		setRoomData(JSON.parse(this.response));
	};

	// Create and send the request
	requestObj.open(
		"get",
		"get-python.php?x=" + dimX
					+ "&y=" + dimY
					+ "&z=" + dimZ
					+ "&m=" + roomMat,
		true
	);
	requestObj.send();
}


// Process the data received from the calculateRoom function.
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
