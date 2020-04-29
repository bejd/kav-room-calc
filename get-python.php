<?php
	$x = $_REQUEST["x"];
	$y = $_REQUEST["y"];
	$z = $_REQUEST["z"];
	$mat = $_REQUEST["m"];

	$output = exec("test.py $x $y $z $mat");

	echo $output;
?>
