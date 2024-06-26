<?php
// show errors
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');
// there is an incoming date 
$date = $_GET['date'];
// convert to date with out time
$dt = new DateTime($date);

$dt->setTime(0, 0, 0);
// $endDate = $dt -> modify('+1 day');
// convert back to string
$dt = $dt->format('Y-m-d');
$eventsOnDate = [];
include_once 'cal/ICal.php';
include_once "FilterCalander.php";
include_once "TDSDocscalander.php";
use ICal\ICal;
//  going to use redis to cash the calander data to reduce the number of calls to the calander server
$redis_Storage = new Redis();
$redis_Storage->connect('127.0.0.1', 6121);




foreach ($calendars as $calendar) {
    // try {
    //     $ical = new ICal('', array(
    //         'defaultSpan'                 => 2,     // Default value
    //         'defaultTimeZone'             => 'UTC',
    //         'defaultWeekStart'            => 'MO',  // Default value
    //         'disableCharacterReplacement' => false, // Default value
    //         'filterDaysAfter'             => null,  // Default value
    //         'filterDaysBefore'            => null,  // Default value
    //         'httpUserAgent'               => null,  // Default value
    //         'skipRecurrence'              => false, // Default value
    //     ));
    //     $ical->initUrl($calendar["url"], $username = null, $password = null, $userAgent = null);
    // } catch (\Exception $e) {
    //     die($e);
    // }
    // see if the calander data is in redis
    $ical = $redis_Storage->get("Calander:".$calendar["name"]);
    if ($ical === false) {
        // if not get it from the calander server
        try {
            $ical = new ICal('', array(
                'defaultSpan'                 => 2,     // Default value
                'defaultTimeZone'             => 'UTC',
                'defaultWeekStart'            => 'MO',  // Default value
                'disableCharacterReplacement' => false, // Default value
                'filterDaysAfter'             => null,  // Default value
                'filterDaysBefore'            => null,  // Default value
                'httpUserAgent'               => null,  // Default value
                'skipRecurrence'              => false, // Default value
            ));
            $ical->initUrl($calendar["url"], $username = null, $password = null, $userAgent = null);
        } catch (\Exception $e) {
            die($e);
        }
        // store the calander data in redis
        // $redis_Storage->set("Calander:".$calendar["name"], $ical, 60 * 60 * 10);
        //  stoe as php serialised data
        $redis_Storage->set("Calander:".$calendar["name"], serialize($ical), 10 * 60);

    } else {
        
        //  if it is in redis then get it
        // $ical = $redis_Storage->get("Calander:".$calendar["name"]);
        //  get the php serialised data
        $ical = unserialize($ical);
    }

    
    $events = $ical->eventsFromRange($dt, $dt);
    // echo count($events)."\n";

    foreach ($events as $event) {
        $event =  (array) $event;
        $event['calendar'] = $calendar;
        unset($event['calendar']["url"]);
        // "dtstart": "20231118",
        // "dtend": "20231119",
        // work out if its an all day event based on if there is a T and time 
      
        // format the date to be more readable
        $event['dtstartf'] = date('H:i', strtotime($event['dtstart']));
        $event['dtendf'] = date('H:i', strtotime($event['dtend']));
        $filtertype = FilterCalanderByInfo($event);
        // create summery with date of start time 
        if ($filtertype == "redacted") {
            // remove all summary to make it say its redacted
            $event['summary'] = "Redacted";
      
        }

        if (strpos($event['dtstart'], 'T') !== false && !strpos($event['dtstart'], 'T000000') !== false) {
            $event['isAllDay'] = false;
            $event['summary1'] = $event['dtstartf'] . " - " . $event['summary'];
        } else {
            $event['isAllDay'] = true;
            $event['summary1'] = $event['summary'];
        }

        // find TDS docs event if it has the docs url in it 
        $event['isDocs'] = ContainsDocsUrl($event);
        if ($event['isDocs']["isDocs"] == true) {
            $url = TDSDocsURL($event['isDocs']["url"]);
            $event['isDocs']["ID"] = $url;
            $event['isDocs']["Doc"] = TDSDocsLookUp($url);
            if ($event['isDocs']["Doc"]["description"] !== null) {
                $event['summary1'] = $event["summary1"] . " - Docs:" . $event['isDocs']["Doc"]["description"];
            }

        }


      
        if ($filtertype != "false") {
            $eventsOnDate[] = $event;
        }
    }
}
// sort events by start time
usort($eventsOnDate, function ($a, $b) {
    return $a['dtstart'] <=> $b['dtstart'];
});
//


// print_r($eventsOnDate);
echo json_encode($eventsOnDate, JSON_PRETTY_PRINT);




function ContainsDocsUrl($event)
{
    if (isset($event['additionalProperties']["url"])) {
        if (strpos($event['additionalProperties']["url"], 'TDSDocs') !== false) {
            return array("isDocs" => true, "url" => $event['additionalProperties']["url"]);
        }
    }

    return false;
}