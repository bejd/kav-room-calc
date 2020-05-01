// Visual effects that aren't important to functionality.

var formItems;										// Array of form items


document.addEventListener("DOMContentLoaded", (event) => {
	formItems = Array.from(document.getElementById("form").children);

	// Add class to show initial items. Items will be revealed as form is filled
	// in by calling the unhideItems() function
	// formItems.forEach(child => {
	// 	if (formItems.indexOf(child) > 1) {
	// 		// child.style.display = "block";
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
		ele.classList.add("show");
	}

	else if (!opt) {
		ele.classList.remove("show");
	}
}
