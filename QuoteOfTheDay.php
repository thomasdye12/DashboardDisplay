<?php

$url = "https://dashboardcomstds-net.local.thomasdye.net/QuoteOfTheDay/index.php";

$data = file_get_contents($url);
// set json header
header('Content-Type: application/json');
echo $data;
