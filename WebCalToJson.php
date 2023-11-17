<?php


// Fetch the content of the webcal URL
$icalData = file_get_contents($webcalUrl);
// echo $icalData;
if ($icalData === false) {
    die("Failed to fetch data from the webcal URL.");
}

// Parse the iCalendar data into an array
$events = [];
$lines = explode("\n", $icalData);
echo print_r($lines);
$event = null;

foreach ($lines as $line) {
    $line = trim($line);

    if (empty($line)) {
        continue;
    }

    if (strpos($line, 'BEGIN:VEVENT') !== false) {
        $event = [];
    } elseif (strpos($line, 'END:VEVENT') !== false) {
        if ($event) {
            $events[] = $event;
        }
        $event = null;
    } elseif ($event) {
        list($key, $value) = explode(':', $line, 2);
        $event[$key] = $value;
    }
}

// Convert the parsed data to JSON
$jsonData = json_encode($events, JSON_PRETTY_PRINT);

// Set the content type to JSON
header('Content-Type: application/json');

// Output the JSON data
echo $jsonData;
?>
