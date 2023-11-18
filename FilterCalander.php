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
                return false;
            }
        }
    







    return true;
}