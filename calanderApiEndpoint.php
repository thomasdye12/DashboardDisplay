<?php
// show errors
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');
header('TDS-Cache: 0');
// Get the dates from the query parameter
$dates = explode(',', $_GET['dates']);
$eventsByDate = [];

include_once 'cal/ICal.php';
include_once "FilterCalander.php";
include_once "TDSDocscalander.php";
use ICal\ICal;

// Connect to Redis
$redis_Storage = new Redis();
$redis_Storage->connect('127.0.0.1', 6121);

// Fetch and cache calendar data once per calendar
$calendarData = [];
foreach ($calendars as $calendar) {
    $calendarData[$calendar["name"]] = array("ICal" => getCalendarData($calendar, $redis_Storage),"calander" => $calendar);
}

// Process each date
foreach ($dates as $date) {
    $eventsByDate[$date] = getEventsForDate($date, $calendarData);
}

echo json_encode($eventsByDate, JSON_PRETTY_PRINT);

/**
 * Get events for a specific date
 *
 * @param string $date
 * @param array $calendarData
 * @return array
 */
function getEventsForDate($date, $calendarData) {
    $eventsOnDate = [];
    $dt = new DateTime($date);
    $dt->setTime(0, 0, 0);
    $formattedDate = $dt->format('Y-m-d');

    foreach ($calendarData as $calendarName => $ical) {
        $events = $ical["ICal"]->eventsFromRangV2($formattedDate, $formattedDate);
        $eventsOnDate = array_merge($eventsOnDate, processEvents($events, $ical["calander"]));
    }
    $uniqueEvents = [];
    foreach ($eventsOnDate as $event) {
        $isDuplicate = false;
        foreach ($uniqueEvents as $addedEvent) {
            if (areSummariesSimilar($event['summary1'], $addedEvent['summary1'])) {
                $isDuplicate = true;
                break;
            }
        }
        if (!$isDuplicate) {
            $uniqueEvents[] = $event;
        }
    }
  
    usort( $uniqueEvents, function ($a, $b) {
        return $a['dtstart'] <=> $b['dtstart'];
    });

    return  $uniqueEvents;
}

/**
 * Get calendar data, either from Redis or from the calendar server
 *
 * @param array $calendar
 * @param Redis $redis
 * @return ICal
 */
function getCalendarData($calendar, $redis) {
    $ical = $redis->get("Calander:" . $calendar["name"]);
    if ($ical === false) {
        try {
            $ical = new ICal('', array(
                'defaultSpan' => 2,
                'defaultTimeZone' => 'UTC',
                'defaultWeekStart' => 'MO',
                'disableCharacterReplacement' => false,
                'filterDaysAfter' => null,
                'filterDaysBefore' => null,
                'httpUserAgent' => null,
                'skipRecurrence' => false,
            ));
            $ical->initUrl($calendar["url"], $username = null, $password = null, $userAgent = null);
            $ical->sortEventsFirst();
            $redis->set("Calander:" . $calendar["name"], serialize($ical), 10 * 60);
        } catch (\Exception $e) {
            die($e);
        }
    } else {
        $ical = unserialize($ical);
    }
    return $ical;
}

/**
 * Process events and apply filters
 *
 * @param array $events
 * @param string $calendarName
 * @return array
 */
function processEvents($events, $calendarName) {
    $eventsOnDate = [];
    foreach ($events as $event) {
        $event = (array)$event;
        $event['calendar'] = $calendarName;
        
        $event['dtstartf'] = date('H:i', strtotime($event['dtstart']));
        $event['dtendf'] = date('H:i', strtotime($event['dtend']));
        $filtertype = FilterCalanderByInfo($event);
        // if filtertype is remove then skip the event
        if ($filtertype == "remove"  || $filtertype == "false") {
            continue;
        }
        if ($filtertype == "redacted") {
            $event['summary'] = "Redacted";
        }

        if (strpos($event['dtstart'], 'T') !== false && strpos($event['dtstart'], 'T000000') === false) {
            $event['isAllDay'] = false;
            $event['summary1'] = $event['dtstartf'] . " - " . $event['summary'];
        } else {
            $event['isAllDay'] = true;
            $event['summary1'] = $event['summary'];
        }

        $event['isDocs'] = ContainsDocsUrl($event);
        if ($event['isDocs']["isDocs"] == true) {
            $url = TDSDocsURL($event['isDocs']["url"]);
            $event['isDocs']["ID"] = $url;
            $event['isDocs']["Doc"] = TDSDocsLookUp($url);
            if (isset($event['isDocs']["Doc"]["description"])) {
                $event['summary1'] = $event["summary1"] . " - Docs:" . $event['isDocs']["Doc"]["description"];
            }
        }
        //  if the lenght of the summery is grather then 10 char then add a ... to the end
        if (strlen($event['summary']) > 10) {
            $event['summary'] = substr($event['summary'], 0, 30) . "...";
        }

        if ($filtertype != "false") {
            $eventsOnDate[] = $event;
        }
    }
    // filter out events with the same summery on the same day

  return $eventsOnDate;

}

function normalizeSummary($summary) {
    return strtolower(trim(preg_replace('/[^a-zA-Z0-9 ]/', '', $summary)));
}

function areSummariesSimilar($summary1, $summary2, $threshold = 50) {
    $summary1 = normalizeSummary($summary1);
    $summary2 = normalizeSummary($summary2);
    // echo "Summary1: " . $summary1 . "\n";
    // echo "Summary2: " . $summary2 . "\n";
    similar_text($summary1, $summary2, $percent);
    return $percent >= $threshold;
}
/**
 * Check if the event contains a TDS docs URL
 *
 * @param array $event
 * @return array
 */
function ContainsDocsUrl($event) {
    if (isset($event['additionalProperties']["url"])) {
        if (strpos($event['additionalProperties']["url"], 'TDSDocs') !== false) {
            return array("isDocs" => true, "url" => $event['additionalProperties']["url"]);
        }
    }
    return array("isDocs" => false);
}
?>
