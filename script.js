// code here for the clock 

var clock = new Vue({
    el: '#clock1',
    data: {
        time: '',
        date: ''
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
    clock.date = dayName + ','+ monthName + ' ' + zeroPadding(cd.getDate(), 2);
}

function zeroPadding(num, digit) {
    var zero = '';
    for (var i = 0; i < digit; i++) {
        zero += '0';
    }
    return (zero + num).slice(-digit);
}

var calendar = new Vue({
    el: '#calendar',
    data: {
        days: []
    },
    mounted() {
        this.generateCalendar();
        // Schedule your function to run every 40 minutes (40 * 60 * 1000 milliseconds) 40 * 60 * 1000
        this.intervalId = setInterval(() => {
            this.generateCalendar();
        }, 40 * 60 * 1000);

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
            firstDayOfCurrentWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1); // First day of the current week (Monday)
            firstDayOfNextWeek.setDate(currentDate.getDate() - currentDate.getDay() + 8); // First day of the next week (Monday)

            // Generate calendar for the current week and the next 4 weeks
            for (let week = 0; week < 6; week++) {
                for (let day = 0; day < 7; day++) {
                    const currentDate = new Date(firstDayOfCurrentWeek);
                    currentDate.setDate(currentDate.getDate() + (week * 7) + day);
                    const isToday = currentDate.toDateString() === new Date().toDateString();

                    // Make an API request to get events for the current date using fetch
                    const events = await this.getEventsForDate(currentDate); // Assuming you have a getEventsForDate function

                    this.days.push({
                        isToday: isToday,
                        title: currentDate.getDate(),
                        events: events // Add events data to the day object
                    });
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


