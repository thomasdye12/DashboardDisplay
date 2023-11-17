<?php


?>

<!--  want to show a clock on the left at the top and then the calnder underneeth it  -->

<html>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;500&display=swap" rel="stylesheet">
<head>
    <title>Calendar</title>
    <link rel="stylesheet" type="text/css" href="style.css">
</head>

<body>
    <div class =clock id="clock">
        <div class =clock1 id="clock1">
            <p class="time">{{ time }}</p>
            <p class="date">{{ date }}</p>
        </div>
    </div>
    <div id="calendar">
    <div class="weekdays weekdays-text">Mon</div>
        <div class="weekdays weekdays-text">Tue</div>
        <div class="weekdays weekdays-text">Wed</div>
        <div class="weekdays weekdays-text">Thu</div>
        <div class="weekdays weekdays-text">Fri</div>
        <div class="weekdays weekdays-text">Sat</div>
        <div class="weekdays weekdays-text">Sun</div>
    <div v-for="day in days" class="calendar-day">
    <div class="red-circleAlways" :class="{ 'red-circle': day.isToday }"> 
    <p class="title">{{ day.title }}</p>
    </div>
    <ul class="event-list">
        <li class="event-item" :class="{ 'AllDay-class': event.calendar.colour === 'red' && event.isAllDay}"  v-for="(event, index) in day.events" :key="index">
            <div class="circle" :class="getCircleColorClass(event.calendar.colour)" ></div>
            <p class="event-text">{{ event.summary }}</p>
        </li>
        <!-- If there are more than 4 events, show a message -->
        <li v-if="day.events.length > 4" class="more-events">
            <p class="event-text">+{{ day.events.length - 4 }} more</p>
        </li>
    </ul>


    </div>

    </div>
</body>


<script src='https://cdnjs.cloudflare.com/ajax/libs/vue/2.3.4/vue.min.js'></script>
<script type="text/javascript" src="script.js"></script>
</html>