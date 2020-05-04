// Visual effects that aren't important to functionality.

var formItems;										// Array of form items
var shrinkResults									// Hide the results form


document.addEventListener("DOMContentLoaded", (event) => {
	shrinkResults = document.getElementById("shrink-results");
	shrinkResults.addEventListener("click", function() {
		shrinkVisualiser();
	});

	// Add class to hide initial items. Items will be revealed as form is filled
	// in by calling the unhideItems() function
	// formItems = Array.from(document.getElementById("form").children);
	// formItems.forEach(child => {
	// 	if (formItems.indexOf(child) > 1) {
	// 		child.classList.add("display-none");
	// 		child.classList.add("opacity-zero");
	// 	}
	// });

	debug();
});


// Quickly show the visualiser on refresh
function debug() {
	dimX = 5.5;
	dimY = 2.98;
	dimZ = 4.9;

	lectX = 1.200;
	lectY = 1.022;
	lectZ = 0.700;

	minViewer = 1.8;
	maxViewer = 3.5;

	calculateRoom();

	screenType = "pj";
	if (screenWidth == undefined) setScreenSize(55);

	drawRoom = true;
	renderRoom();
	showBox(resultsBox, true);
}


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
			100,
			formItems[start + i]
		);

	}
}


// Show or hide hidden elements
function showBox(ele, opt) {
	if (opt) {
		if (ele.classList.contains("show")) return;

		ele.classList.add("show");
		document.getElementById("main").classList.add("results-space");

		setTimeout(() => {
			window.scrollTo( { top: document.body.scrollHeight, behavior: "smooth" } );
		}, 750);
	}

	else if (!opt) {
		ele.classList.remove("show");
		document.getElementById("main").classList.remove("results-space");
	}
}


// Shrink the visualiser
function shrinkVisualiser() {
	shrinkResults.classList.toggle("rotate");
	resultsBox.classList.toggle("shrink");
	document.getElementById("main").classList.toggle("results-shrink");
}
