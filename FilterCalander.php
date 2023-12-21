<?php
// 

$CalanderWordblacklist = [
    "Gordon" => [
        
    ]

    ];
function FilterCalanderByInfo($event) {
  
    global $CalanderWordblacklist;


    //  check if the event is in the blacklist, check if the event summary contains any of the words in the blacklist
        foreach ($CalanderWordblacklist as $word => $value) {
            if (strpos($event['summary'], $word) !== false) {
                return "redacted";
            }
        }
        // if the description not null and contains "{notv}"
        if ($event['description'] !== null && strpos($event['description'], "{notv}") !== false) {
            return "redacted";
        }
        // if summerry contains Hanukkah
        if (strpos($event['summary'], "Hanukkah") !== false) {
            return "false";
        }




    return "true";
}