// code here for the clock 

var clock = new Vue({
    el: '#clock1',
    data: {
        time: '',
        date: '',
        time2: '',
        quote: 'Loading Down',
        utcTimezoneOffset: -4.0 // for time
    }
});

var week = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
var timerID = setInterval(updateTime, 1000);
updateTime();
function updateTime() {
    var cd = new Date();

    // Define an array of day names
    var dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    // Define an array of month names
    var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    // Get the day name and month name by indexing the respective arrays
    var dayName = dayNames[cd.getDay()];
    var monthName = monthNames[cd.getMonth()];

    clock.time = zeroPadding(cd.getHours(), 2) + ':' + zeroPadding(cd.getMinutes(), 2) + ':' + zeroPadding(cd.getSeconds(), 2);
    clock.date = dayName + ',' + monthName + ' ' + zeroPadding(cd.getDate(), 2);
  // UTC time
  var utc = cd.getTime() + (cd.getTimezoneOffset() * 60000);

  // Offset time (e.g., UTC-4)
  var offsetTime2 = new Date(utc + (clock.utcTimezoneOffset * 3600000));
  clock.time2 = zeroPadding(offsetTime2.getHours(), 2) + ':' +
      zeroPadding(offsetTime2.getMinutes(), 2) + ':' +
      zeroPadding(offsetTime2.getSeconds(), 2);
}

function zeroPadding(num, digit) {
    var zero = '';
    for (var i = 0; i < digit; i++) {
        zero += '0';
    }
    return (zero + num).slice(-digit);
}






var calendar = new Vue({
    el: '#calendar-wrapper',
    data: {
        days: [],
        today: {
            events: []
        },

    },
    computed: {
        allDayEvents() {
            return this.today.events.filter(event => event.isAllDay);
        },
        timedEvents() {
            return this.today.events.filter(event => !event.isAllDay);
        }
    },
    mounted() {
        this.generateCalendar();
        // Schedule your function to run every 40 minutes (40 * 60 * 1000 milliseconds) 40 * 60 * 1000
        this.intervalId = setInterval(() => {
            this.generateCalendar();
        },1 * 60 * 60 * 1000);

        //  1 * 60 * 60 * 1000

    },
    beforeDestroy() {
        // Clean up the interval when the Vue instance is destroyed
        clearInterval(this.intervalId);
    },
    methods: {
        async generateCalendar() {
            const currentDate = new Date();
            const firstDayOfCurrentWeek = new Date(currentDate);
            const firstDayOfNextWeek = new Date(currentDate);
            
            // Set the first day of the current week (Monday)
            firstDayOfCurrentWeek.setDate(currentDate.getDate() - (currentDate.getDay() + 6) % 7);
            
            // Set the first day of the next week (Monday)
            firstDayOfNextWeek.setDate(firstDayOfCurrentWeek.getDate() + 7);
            
            let dates = [];
        
            // Generate calendar for the current week and the next 4 weeks
            for (let week = 0; week < 5; week++) {
                for (let day = 0; day < 7; day++) {
                    const date = new Date(firstDayOfCurrentWeek);
                    date.setDate(date.getDate() + (week * 7) + day);
                    dates.push(date);
                }
            }

            // Fetch events for all dates in a single request
            const eventsMap = await this.getEventsForDates(dates);
            this.days = [];
            dates.forEach(date => {
                const isToday = date.toDateString() === new Date().toDateString();
                const isCurrentMonth = date.getMonth() === firstDayOfCurrentWeek.getMonth();
                const events = eventsMap[date.toISOString().split('T')[0]] || []; // Get events for the current date

                var title = date.getDate();
                var month = '';
                //  if month is not current and day is 1 then add month name
                if (!isCurrentMonth && title == 1) {
                    month = date.toLocaleString('default', { month: 'short' });
                } else if (isCurrentMonth && dates.indexOf(date) == 0) {
                    month = date.toLocaleString('default', { month: 'short' });
                }
                
                this.days.push({
                    isToday: isToday,
                    month: month,
                    title: title,
                    events: events // Add events data to the day object
                });

                if (isToday) {
                    this.today = this.days[this.days.length - 1
                    ];
                }
            });
        },

        async getEventsForDates(dates) {
            try {
                // Create a query parameter with all dates
                const dateStrings = dates.map(date => date.toISOString().split('T')[0]);
                const response = await fetch(`calanderApiEndpoint.php?dates=${dateStrings.join(',')}`); // Adjust the API endpoint and query parameters accordingly

                if (response.ok) {
                    const data = await response.json();
                    return data; // Return the events data mapped by date
                } else {
                    console.error('Error fetching events:', response.status, response.statusText);
                    return {}; // Return an empty object in case of an error
                }
            } catch (error) {
                console.error('Error fetching events:', error);
                return {}; // Return an empty object in case of an error
            }
        },

        getCircleColorClass(colorKey) {
            // Map colorKey to CSS classes representing colors
            const colorClassMap = {
                red: 'red-circle',
                blue: 'blue-circle',
                green: 'green-circle',
                yellow: 'yellow-circle',
                purple: 'purple-circle',
                orange: 'orange-circle',
                // Add more color mappings as needed
            };

            // Return the CSS class based on the color key
            return colorClassMap[colorKey] || 'default-circle';
        }
    }
});




var weather = new Vue({
    el: '#weather',
    data: {
        WeatherData: []
    },
    mounted() {
        this.getWeather();
        // Schedule your function to run every 40 minutes (40 * 60 * 1000 milliseconds) 40 * 60 * 1000
        // this.intervalId = setInterval(() => {
        //     this.getWeather();
        // }, 60 * 60 * 1000);
        // at 1 minute past every hour update the weather
        this.intervalId = setInterval(() => {
            var cd = new Date();
            if (cd.getMinutes() == 1) {
                this.getWeather();
            }
        }, 60 * 1000);

    },
    beforeDestroy() {
        // Clean up the interval when the Vue instance is destroyed
        clearInterval(this.intervalId);
    },
    methods: {
        async getWeather() {
            try {
                this.WeatherData = [];
                // Make an API request to fetch events for the given date using fetch
                const response = await fetch(`WeatherApi.php`); // Adjust the API endpoint and query parameters accordingly

                if (response.ok) {
                    const data = await response.json();
                    // loop over the data. Appleweatherdata.forecastHourly.hours
                    this.WeatherData = data.Appleweatherdata.forecastHourly.hours;
                } else {
                    console.error('Error fetching weather:', response.status, response.statusText);
                    return []; // Return an empty array in case of an error
                }
            } catch (error) {
                console.error('Error fetching weather:', error);
                return []; // Return an empty array in case of an error
            }
        }
    }
});


// define mapkit


var PersonMaps = new Vue({
    el: '#map',
    data: {
        Users: [],
        map: null, // Map object
        currentUserIndex: 0, // Index to track the highlighted user
        highlightInterval: null, // Interval ID for user rotation
    },
    mounted() {
        this.getPersonMaps();
        
        // Refresh map data every 25 minutes
        this.intervalId = setInterval(() => {
            this.getPersonMaps();
        }, 25 * 60 * 1000);

        // Start cycling through users every 20 seconds
        this.highlightInterval = setInterval(() => {
            this.highlightNextUser();
        }, 20 * 1000);
    },
    beforeDestroy() {
        clearInterval(this.intervalId);
        clearInterval(this.highlightInterval);
    },
    methods: {
        async getPersonMaps() {
            try {
                const response = await fetch(`LocationTrackingapi.php`);
                if (response.ok) {
                    const data = await response.json();
                    this.Users = data.location;

                    mapkit.init({
                        authorizationCallback: function (done) {
                            done(data.JWT);
                        }
                    });

                    // Initialize map if not already created
                    if (!this.map) {
                        this.map = new mapkit.Map("map");
                        this.map.colorScheme = mapkit.Map.ColorSchemes.Dark;
                        this.map.showsMapTypeControl = false;
                        this.map.showsZoomControl = false;
                        this.map.mapType = mapkit.Map.MapTypes.Hybrid;
                    }

                    // Clear existing annotations before adding new ones
                    this.map.removeAnnotations(this.map.annotations);

                    // Add all users to the map
                    this.Users.forEach(element => {
                        this.addAnnotationToMap(element, data.localisedAddress);
                    });

                    // Adjust the map region
                    // this.adjustMapRegion();
                    this.highlightNextUser();

                } else {
                    console.error('Error fetching personMaps:', response.status, response.statusText);
                }
            } catch (error) {
                console.error('Error fetching personMaps:', error);
            }
        },
        highlightNextUser() {
            if (this.Users.length === 0) return;

            // Increment index, loop back if at the end
            this.currentUserIndex = (this.currentUserIndex + 1) % this.Users.length;

            // Highlight the user by zooming in on their location
            const user = this.Users[this.currentUserIndex];
            if (user && user.Location && user.Location.Location) {
                const coordinate = new mapkit.Coordinate(
                    user.Location.Location.latitude,
                    user.Location.Location.longitude
                );

                // Set region to focus on the highlighted user
                const region = new mapkit.CoordinateRegion(
                    coordinate,
                    new mapkit.CoordinateSpan(0.0009, 0.0009) // Zoom in closer
                );

                this.map.setRegionAnimated(region);
            }
        },
        addAnnotationToMap(element, localisedNames) {
            var annotation = new mapkit.MarkerAnnotation(
                new mapkit.Coordinate(element.Location.Location.latitude, element.Location.Location.longitude)
            );
            annotation.color = element.color;
            annotation.title = element.name;
            annotation.subtitle = "person";

            var geocoder = new mapkit.Geocoder({
                language: "en-GB"
            }).reverseLookup(annotation.coordinate, (err, data) => {
                annotation.subtitle = LocaliseNames(data.results[0].name, localisedNames);
            });

            if (element.imageurl) {
                const imageDelegate = {
                    getImageUrl(scale, callback) {
                        callback(element.imageurl);
                    }
                };
                annotation.glyphImage = imageDelegate;
            }

            annotation.titleVisibility = mapkit.FeatureVisibility.Visible;
            annotation.subtitleVisibility = mapkit.FeatureVisibility.Visible;

            // Add annotation to map
            this.map.addAnnotation(annotation);

            // Store annotation reference
            element.annotation = annotation;
        },
        adjustMapRegion() {
            if (this.Users.length === 0) return;

            let minLat = Infinity, maxLat = -Infinity, minLon = Infinity, maxLon = -Infinity;

            this.Users.forEach(user => {
                const lat = user.Location.Location.latitude;
                const lon = user.Location.Location.longitude;

                if (lat < minLat) minLat = lat;
                if (lat > maxLat) maxLat = lat;
                if (lon < minLon) minLon = lon;
                if (lon > maxLon) maxLon = lon;
            });

            const centerLat = (minLat + maxLat) / 2;
            const centerLon = (minLon + maxLon) / 2;
            const spanLat = maxLat - minLat;
            const spanLon = maxLon - minLon;

            const region = new mapkit.CoordinateRegion(
                new mapkit.Coordinate(centerLat, centerLon),
                new mapkit.CoordinateSpan(spanLat * 1.09, spanLon * 1.09) // Adding some padding
            );

            this.map.setRegionAnimated(region);
        }
    }
});


function LocaliseNames(name, localisedNames) {
    var localisedName = localisedNames.find(x => x.name == name);
    return localisedName ? localisedName.localisedName : name;
}


var calendarKey = new Vue({
    el: '#calendarKey',
    data: {
        keyData: {} // Initially empty, will be filled with API data
    },
    mounted() {
        this.fetchCalendarKey();
    },
    methods: {
        async fetchCalendarKey() {
            try {
                const response = await fetch('CalanderKey.php');
                if (response.ok) {
                    const data = await response.json();
                    
                    // Convert the response into the expected keyData format
                    let formattedKeyData = {};
                    data.forEach(item => {
                        formattedKeyData[item.colour] = item.name;
                    });

                    this.keyData = formattedKeyData;
                } else {
                    console.error('Error fetching calendar key:', response.status, response.statusText);
                }
            } catch (error) {
                console.error('Error fetching calendar key:', error);
            }
        }
    }
});