<?php

require "/Server/app/mongoDBConfig/includes/vendor/autoload.php";
$connection = new MongoDB\Client("mongodb://main.db.local.thomasdye.net:27018");
$TDShomeServer = $connection->selectDatabase("TDShomeServer");
$QuotesOftheDay = $TDShomeServer->selectCollection("QuotesOftheDay");
// for all keys in the db go over them and add a new field called AgeRating
$QuotesOftheDay->updateMany(
    [],
    ['$set' => ["AgeRating" => "U"]],
    ['upsert' => false]
);



// // get the contens of a json file, and decode it into an array

// $fileurl = "jokes.json";
// $json = file_get_contents($fileurl);
// $json = json_decode($json, true);
// // loop over the array and insert each item into the database
// foreach ($json as $key => $value) {
//     $Quote = array();
//     $Quote["Quote"] = $value["body"];
//     $Quote["Author"] = "Unknown";
//     $Quote["tags"] = $value["tags"];
//     $Quote["enabled"] = true;
//     // add 
//     $QuotesOftheDay->insertOne($Quote);


// }


