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
    <div class="overlay"></div>
    <div class=clock id="clock">
        <div class=clock1 id="clock1">
            <p class="time">{{ time }}</p>
            <p class="date">{{ date }}</p>
        </div>
    </div>
    <!-- weather info -->
    <div class="weather" id="weather">
        <div v-for="WeatherHour in WeatherData" class="weather-Hour">
            <img class="weather-icon" :src="WeatherHour.weather_icons" />
            <p class="weather-time">{{ WeatherHour.formattedtime }} - {{ WeatherHour.temperature }}°</p>


        </div>
    </div>
    <!-- calander info -->
    <div id="calendar-wrapper">
        <!-- todays calander events only -->
        <div class="calendar-today" id="calander-today">
            <!-- <p class="title">{{ today.title }}</p> -->
            <ul class="event-list">
                <li class="event-item" :class="{ 'AllDay-class': event.calendar.colour === 'red' && event.isAllDay}" v-for="(event, index) in today.events" :key="index">
                    <div class="circle" :class="getCircleColorClass(event.calendar.colour)"></div>
                    <p class="event-text">{{ event.summary1 }}</p>
                </li>
            </ul>

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
                <p class="title-month">{{ day.month }}</p>
                <div class="red-circleAlways" :class="{ 'red-circle': day.isToday }">

                    <p class="title">{{ day.title }}</p>
                </div>
                <ul class="event-list">
                    <li class="event-item" :class="{ 'AllDay-class': event.calendar.colour === 'red' && event.isAllDay}" v-for="(event, index) in day.events" :key="index">
                        <div class="circle" :class="getCircleColorClass(event.calendar.colour)"></div>
                        <p class="event-text">{{ event.summary }}</p>
                    </li>
                    <!-- If there are more than 4 events, show a message -->
                    <li v-if="day.events.length > 4" class="more-events">
                        <p class="event-text">+{{ day.events.length - 4 }} more</p>
                    </li>
                </ul>


            </div>

        </div>
    </div>
    <!-- locaton map of users -->
     <div class="mapOverview" id="map">
     <div v-for="User in Users" class="map-Person">
        <div class="map-PersonsMap" :id="User.Device">
        </div>

     </div>
    </div>


   
</body>


<script src='https://cdnjs.cloudflare.com/ajax/libs/vue/2.3.4/vue.min.js'></script>
<script src="https://cdn.apple-mapkit.com/mk/5.x.x/mapkit.js"></script>
<script type="text/javascript" src="script.js"></script>

</html>