document.getElementById('city').addEventListener('input', function () { 
    var city = this.value;
    getWeather(city);
});

async function getWeather() {
    try {
        var city = document.getElementById('city').value;
        console.log('City name:', city);

        const response = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
            params: {
                q: city,
                appid: '54a57bc234ad752a4f59e59cd372201d',
                units: 'metric'
            },
        });

        const currentTemperature = response.data.list[0].main.temp;
        document.querySelector('.weather-temp').textContent = Math.round(currentTemperature) + 'ºC';

        const forecastData = response.data.list;
        const dailyForecast = {};
        forecastData.forEach((data) => {
            const day = new Date(data.dt * 1000).toLocaleDateString('en-US', { weekday: 'long' });
            if (!dailyForecast[day]) {
                dailyForecast[day] = {
                    minTemp: data.main.temp_min,
                    maxTemp: data.main.temp_max,
                    description: data.weather[0].description,
                    humidity: data.main.humidity,
                    windSpeed: data.wind.speed,
                    icon: data.weather[0].icon,
                };
            } else {
                dailyForecast[day].minTemp = Math.min(dailyForecast[day].minTemp, data.main.temp_min);
                dailyForecast[day].maxTemp = Math.max(dailyForecast[day].maxTemp, data.main.temp_max);
            }
        });

        document.querySelector('.date-dayname').textContent = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        const date = new Date().toUTCString();
        const extractedDateTime = date.slice(5, 16);
        document.querySelector('.date-day').textContent = extractedDateTime.toLocaleString('en-US');

        const currentWeatherIconCode = dailyForecast[new Date().toLocaleDateString('en-US', { weekday: 'long' })].icon;
        const weatherIconElement = document.querySelector('.weather-icon');
        weatherIconElement.innerHTML = getWeatherIcon(currentWeatherIconCode);

        document.querySelector('.location').textContent = response.data.city.name;
        document.querySelector('.weather-desc').textContent = dailyForecast[new Date().toLocaleDateString('en-US', { weekday: 'long' })].description.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

        document.querySelector('.humidity .value').textContent = dailyForecast[new Date().toLocaleDateString('en-US', { weekday: 'long' })].humidity + ' %';
        document.querySelector('.wind .value').textContent = dailyForecast[new Date().toLocaleDateString('en-US', { weekday: 'long' })].windSpeed + ' m/s';

        // Get the wind speed for the current day
        const currentWindSpeed = dailyForecast[new Date().toLocaleDateString('en-US', { weekday: 'long' })].windSpeed;
        const { windSignal, windColor } = getWindSignal(currentWindSpeed);  // Get signal and color

        // Display the wind signal
        document.querySelector('.wind-signal').textContent = windSignal;

        // Apply color to the wind signal based on wind speed
        document.querySelector('.wind-signal').style.color = windColor;

        const dayElements = document.querySelectorAll('.day-name');
        const tempElements = document.querySelectorAll('.day-temp');
        const iconElements = document.querySelectorAll('.day-icon');

        dayElements.forEach((dayElement, index) => {
            const day = Object.keys(dailyForecast)[index];
            const data = dailyForecast[day];
            dayElement.textContent = day;
            tempElements[index].textContent = `${Math.round(data.minTemp)}º / ${Math.round(data.maxTemp)}º`;
            iconElements[index].innerHTML = getWeatherIcon(data.icon);
        });

    } catch (error) {
        console.error('An error occurred while fetching the data:', error.message);
    }
}

function getWeatherIcon(iconCode) {
    const iconBaseUrl = 'https://openweathermap.org/img/wn/';
    const iconSize = '@2x.png';
    return `<img src="${iconBaseUrl}${iconCode}${iconSize}" alt="Weather Icon">`;
}

function getWindSignal(windSpeed) {
    let windSignal;
    let windColor;

    if (windSpeed >= 61) {
        windSignal = "Signal #5: Wind Speed ≥ 61 m/s";
        windColor = "red";  // High wind, dangerous conditions
    } else if (windSpeed >= 48) {
        windSignal = "Signal #4: Wind Speed 48-61 m/s";
        windColor = "orange";  // Strong wind, potentially dangerous
    } else if (windSpeed >= 34) {
        windSignal = "Signal #3: Wind Speed 34-47 m/s";
        windColor = "yellow";  // Moderate wind
    } else if (windSpeed >= 17) {
        windSignal = "Signal #2: Wind Speed 17-33 m/s";
        windColor = "lightgreen";  // Mild wind
    } else if (windSpeed >= 8) {
        windSignal = "Signal #1: Wind Speed 8-16 m/s";
        windColor = "green";  // Light wind
    } else {
        windSignal = "No significant wind";
        windColor = "gray";  // Calm conditions
    }

    return { windSignal, windColor };
    
}

document.addEventListener("DOMContentLoaded", function () {
    getWeather();
    setInterval(getWeather, 900000);  // Refresh weather every 15 minutes
});



