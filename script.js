// code here for the clock 

var clock = new Vue({
    el: '#clock1',
    data: {
        time: '',
        date: '',
        quote: 'Loading Down'
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
}

function zeroPadding(num, digit) {
    var zero = '';
    for (var i = 0; i < digit; i++) {
        zero += '0';
    }
    return (zero + num).slice(-digit);
}
//  add code here to get quote of the day
// QuoteOfTheDay.php
function  LoadQuote() {
    fetch('QuoteOfTheDay.php')
        .then(response => response.json())
        .then(data => {
            clock.quote = data.Quote;
        });
}
LoadQuote();
this.intervalIdLoadQuote = setInterval(() => {
    var cd = new Date();
    //  only at 1 min pas midnight
    if (cd.getHours() == 0 && cd.getMinutes() == 1) {
        LoadQuote();
    }
}, 60 * 1000);






var calendar = new Vue({
    el: '#calendar-wrapper',
    data: {
        days: [],
        today: []
    },
    mounted() {
        this.generateCalendar();
        // Schedule your function to run every 40 minutes (40 * 60 * 1000 milliseconds) 40 * 60 * 1000
        this.intervalId = setInterval(() => {
            this.generateCalendar();
        }, 1 * 60 * 60 * 1000);

    },
    beforeDestroy() {
        // Clean up the interval when the Vue instance is destroyed
        clearInterval(this.intervalId);
    },
    methods: {
        async generateCalendar() {
            this.days = [];
            const currentDate = new Date();
            const firstDayOfCurrentWeek = new Date(currentDate);
            const firstDayOfNextWeek = new Date(currentDate);
            
            // Set the first day of the current week (Monday)
            firstDayOfCurrentWeek.setDate(currentDate.getDate() - (currentDate.getDay() + 6) % 7);
            
            // Set the first day of the next week (Monday)
            firstDayOfNextWeek.setDate(firstDayOfCurrentWeek.getDate() + 7);
        
            // Generate calendar for the current week and the next 4 weeks
            for (let week = 0; week < 4; week++) {
                for (let day = 0; day < 7; day++) {
                    const currentDate = new Date(firstDayOfCurrentWeek);
                    currentDate.setDate(currentDate.getDate() + (week * 7) + day);
                    const isToday = currentDate.toDateString() === new Date().toDateString();
                    const isCurrentMonth = currentDate.getMonth() === firstDayOfCurrentWeek.getMonth();
                    // Make an API request to get events for the current date using fetch
                    const events = await this.getEventsForDate(currentDate); // Assuming you have a getEventsForDate function
                    var title = currentDate.getDate();
                    var month = '';
                    //  if month is not current and day is 1 then add month name
                    if (!isCurrentMonth && title == 1) {
                        month = currentDate.toLocaleString('default', { month: 'short' });
                    } else if (isCurrentMonth && week == 0 && day == 0) {
                        month = currentDate.toLocaleString('default', { month: 'short' });
                    }
                    this.days.push({
                        isToday: isToday,
                        month: month,
                        title: title,
                        events: events // Add events data to the day object
                    });
                    if (isToday) {
                        this.today = this.days[this.days.length - 1];
                    }
                }
            }
        },
        
        async getEventsForDate(date) {
            try {
                // Make an API request to fetch events for the given date using fetch
                const response = await fetch(`calanderApiEndpoint.php?date=${date.toISOString()}`); // Adjust the API endpoint and query parameters accordingly

                if (response.ok) {
                    const data = await response.json();
                    return data; // Return the events data
                } else {
                    console.error('Error fetching events:', response.status, response.statusText);
                    return []; // Return an empty array in case of an error
                }
            } catch (error) {
                console.error('Error fetching events:', error);
                return []; // Return an empty array in case of an error
            }
        }, getCircleColorClass(colorKey) {
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
        Users: []
    },
    mounted() {
        this.getPersonMaps();
        // Schedule your function to run every 40 minutes (40 * 60 * 1000 milliseconds) 40 * 60 * 1000
        this.intervalId = setInterval(() => {
            this.UpdateView();
        }, 15 * 60 * 1000);

    },
    beforeDestroy() {
        // Clean up the interval when the Vue instance is destroyed
        clearInterval(this.intervalId);
    },
    methods: {
        async getPersonMaps() {
            try {
                this.personMaps = [];
                // Make an API request to fetch events for the given date using fetch
                const response = await fetch(`LocationTrackingapi.php`); // Adjust the API endpoint and query parameters accordingly

                if (response.ok) {
                    const data = await response.json();
                    // loop over the data. Appleweatherdata.forecastHourly.hours
                    this.Users = data.location;
                    mapkit.init({
                        authorizationCallback: function (done) {
                            done(data.JWT);
                        }
                    });
                    // loop over the data.location
                    // wait 2 seconds 
                    //     data.location.forEach(element => {
                    //         ShowMapForUser(mapkit, element.Device, element.Location.Location.latitude, element.Location.Location.longitude);
                    //   });
                    // wait 2 seconds before calling again
                    const self = this;
                    setTimeout(function () {
                        self.Users.forEach(element => {
                            element.map = ShowMapForUser(element, data.localisedAddress);
                        });
                    }, 2000);
                } else {
                    console.error('Error fetching personMaps:', response.status, response.statusText);
                    return []; // Return an empty array in case of an error
                }
            } catch (error) {
                console.error('Error fetching personMaps:', error);
                return []; // Return an empty array in case of an error
            }
        }, async UpdateView() {
            try {
                this.personMaps = [];
                // Make an API request to fetch events for the given date using fetch
                const response = await fetch(`LocationTrackingapi.php`); // Adjust the API endpoint and query parameters accordingly

                if (response.ok) {
                    const data = await response.json();
                    // get both the old data and the new data
                    // loop over the data.location
                    data.location.forEach(element => {
                     
                        //  get the old data
                        var oldData = this.Users.find(x => x.Device == element.Device);
                        if (oldData == null) {
                            return;
                        }
                        // if the 2 are the same then do nothing
                        if (oldData.Location.Location.latitude == element.Location.Location.latitude && oldData.Location.Location.longitude == element.Location.Location.longitude) {
                            return;
                        }
                        mapkit.init({
                            authorizationCallback: function (done) {
                                done(data.JWT);
                            }
                        });
                        // update the map
                        UpdateMapData(oldData, element, data.localisedAddress);
                        // update the data
                        oldData.Location.Location.latitude = element.Location.Location.latitude;
                        oldData.Location.Location.longitude = element.Location.Location.longitude;
                        
                    });

                } else {
                    console.error('Error fetching personMaps:', response.status, response.statusText);
                    return []; // Return an empty array in case of an error
                }
            } catch (error) {
                console.error('Error fetching personMaps:', error);
                return []; // Return an empty array in case of an error
            }

        }

    }
});

function ShowMapForUser(element,localisedNames) {
    var map = new mapkit.Map(element.Device);
    var workAnnotation = new mapkit.MarkerAnnotation(new mapkit.Coordinate(element.Location.Location.latitude, element.Location.Location.longitude));
    workAnnotation.color = element.color;
    workAnnotation.title = element.name;    //+ " \n "  + element.Location.formattedTime;
    workAnnotation.subtitle = "persom";
    workAnnotation.selected = true;
    map.mapType = "satellite";
    var geocoder = new mapkit.Geocoder({
        language: "en-GB"
    }).reverseLookup(workAnnotation.coordinate, (err, data) => {
        workAnnotation.subtitle =LocaliseNames(data.results[0].name,localisedNames);
        console.log(data.results[0]);
    });
    if (element.imageurl) {
    const imageDelegate = {
        getImageUrl(scale, callback) {
            callback(element.imageurl);
        }
    };
    workAnnotation.glyphImage = imageDelegate;
}
    var newCenter = workAnnotation.coordinate;
    var span = new mapkit.CoordinateSpan(.01);
    var region = new mapkit.CoordinateRegion(newCenter, span);
    map.setRegionAnimated(region)

    map.showItems([workAnnotation]);
    return map;
}


function UpdateMapData(OldData, NewData,localisedNames) {
    var map = OldData.map;
    map.removeAnnotations(map.annotations);
    var workAnnotation = new mapkit.MarkerAnnotation(new mapkit.Coordinate(NewData.Location.Location.latitude, NewData.Location.Location.longitude));
    workAnnotation.color = NewData.color;
    workAnnotation.title = NewData.name;   //+ " \n "  + element.Location.formattedTime;
    workAnnotation.subtitle = "";
    workAnnotation.selected = true;
    map.mapType = "satellite";
    var geocoder = new mapkit.Geocoder({
        language: "en-GB"
    }).reverseLookup(workAnnotation.coordinate, (err, data) => {
        workAnnotation.subtitle = LocaliseNames(data.results[0].name,localisedNames);
        console.log(data.results[0]);
    });
    if (NewData.imageurl) {
        const imageDelegate = {
            getImageUrl(scale, callback) {
                callback(NewData.imageurl);
            }
        };
        workAnnotation.glyphImage = imageDelegate;
    }
    var newCenter = workAnnotation.coordinate;
    var span = new mapkit.CoordinateSpan(.01);
    var region = new mapkit.CoordinateRegion(newCenter, span);
    map.setRegionAnimated(region)

    map.showItems([workAnnotation]);
    return map;
}

function LocaliseNames(name,localisedNames) {
    // if the name is one of the localised names then return the localised name
    // else return the name
    var localisedName = localisedNames.find(x => x.name == name);
    if (localisedName == null) {
        return name;
    }
    return localisedName.localisedName;

}