// Visual effects that aren't important to functionality.

var formItems;										// Array of form items


document.addEventListener("DOMContentLoaded", (event) => {
	formItems = Array.from(document.getElementById("form").children);

	// Add class to show initial items. Items will be revealed as form is filled
	// in by calling the unhideItems() function
	formItems.forEach(child => {
		if (formItems.indexOf(child) > 1) {
			// child.style.display = "block";
			child.classList.add("display-none");
			child.classList.add("opacity-zero");
		}
	});

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
			100,
			formItems[start + i]
		);

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
