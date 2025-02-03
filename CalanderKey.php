<?php

include_once 'cal/ICal.php';
include_once "FilterCalander.php";
include_once "TDSDocscalander.php";


// $calendars
$showkey = array();
echo json_encode($calendars, JSON_PRETTY_PRINT);