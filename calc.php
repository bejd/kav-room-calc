<?php
	$dimX = $_REQUEST["x"];
	$dimY = $_REQUEST["y"];
	$dimZ = $_REQUEST["z"];

	$output = exec("test.py $dimX $dimY $dimZ");

	echo $output;
?>
