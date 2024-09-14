const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("searchbtn");

const apiKey = "5b02de5931cde133a67aa5c910b39800"

const weatherInfoSection = document.getElementById("weather-info");
const searchCitySection = document.getElementById("search-city");
const notFoundSection = document.getElementById("not-found");

const cityName = document.getElementById("city-name");
const currentDate = document.getElementById("current-date");
const tempText = document.getElementById("temp-txt");
const condition = document.getElementById("condition-txt");
const feelsTemp = document.getElementById("feels-temp-txt");
const precip = document.getElementById("precipitation-txt");
const visibility = document.getElementById("visibility-txt");
const humidityValue = document.getElementById("humidity-txt");
const sunrise = document.getElementById("sunrise-time");
const sunset = document.getElementById("sunset-time");
const windSpeed = document.getElementById("wind-speed");
const weatherSummaryImg = document.getElementById("weather-summary-img");

const hourlyForecastContainer = document.getElementById("hourly-forecast-container");
const daysForecastContainer = document.getElementById("days-forecast-container");

// SEARCHBAR FUNCTION

searchBtn.addEventListener("click", () => {
    if (cityInput.value.trim() != "") {
        updateWeatherInfo(cityInput.value)
        cityInput.value = ""
        cityInput.blur()
    }
})

cityInput.addEventListener("keydown", (event) => {
    if (event.key == "Enter" &&
        cityInput.value.trim() != ""
    ) {
        updateWeatherInfo(cityInput.value)
        cityInput.value = ""
        cityInput.blur()
    }
})

// FETCHING DATA FROM API

async function getFetchData(endPoint, city) {
    const apiURL = `https://api.openweathermap.org/data/2.5/${endPoint}?q=${city}&appid=${apiKey}&units=metric`

    const response =  await fetch(apiURL)

    return response.json()
}

// FUNCTION FOR CHANGING ICON FOR DIFFERENT WEATHER 

function getWeatherIcon(id) {
    if (id <= 232) return "thunderstorm.svg"
    if (id <= 321) return "drizzle.svg"
    if (id <= 531) return "rain.svg"
    if (id <= 622) return "snow"
    if (id <= 781) return "atmosphere.svg"
    if (id <= 800) return "clear.svg"
    else return "clouds.svg"
}

// FUNCTION TO CHANGE BACKGROUND IMAGE FOR DIFFERENT WEATHER

function setWeatherBackground(weatherId) {
    const body = document.body;  
    
    body.className = '';

    if (weatherId <= 232) {
        body.classList.add('thunderstorm-bg');
    } else if (weatherId >= 233 && weatherId < 322) {
        body.classList.add('drizzle-bg');
    } else if (weatherId >= 322 && weatherId < 532) {
        body.classList.add('rain-bg');
    } else if (weatherId >= 532 && weatherId < 623) {
        body.classList.add('snow-bg');
    } else if (weatherId >= 623 && weatherId < 782) {
        body.classList.add('atmosphere-bg');
    } else if (weatherId >= 782 && weatherId < 801) {
        body.classList.add('clear-sky-bg');
    } else {
        body.classList.add('clouds-bg');
    }
}

// FUNCTION TO GET CURRENT DATE

function getCurrentDate() {
    const currentDate =new Date()
    const options = {
        weekday: "short",
        day: "2-digit",
        month: "short"
    }

    return currentDate.toLocaleDateString("en-GB", options)
}

// FUNCTION TO SHOW TIME IN FORMAT HH:MM

function getTimeFormat(Timestamp) {
    const Time = new Date(Timestamp * 1000)
    const options = {
        hour: "2-digit",
        minute: "2-digit"
    }

    return Time.toLocaleTimeString("en-GB", options)
}

// FUNCTION TO GET WEEK DAY FROM DATE

function getWeekDay(dateTxt) {
    const d = new Date(dateTxt)
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const dayIndex = d.getDay()
    return daysOfWeek[dayIndex]
}

// FUNCTION FOR SHOWING WEATHER INFORMATION

async function updateWeatherInfo(city) {
    const weatherData = await getFetchData("weather", city)

    if (weatherData.cod != 200) {
        showDisplaySection(notFoundSection)
        return
    }

    const {
        name: city_Name, 
        sys: { sunrise: sunriseTimestamp, sunset: sunsetTimestamp }, 
        main: { temp, feels_like, humidity }, 
        weather: [{ id, main: conditionValue }], 
        visibility: visibilityValue, 
        wind: { speed: windSpeedValue } 
    } = weatherData

    cityName.textContent = `${city_Name}`;

    currentDate.textContent = getCurrentDate();

    tempText.textContent = `${Math.round(temp)} °C`;

    condition.textContent = conditionValue;

    feelsTemp.textContent = `${Math.round(feels_like)} °C`;

    precip.textContent = "N/A";

    visibility.textContent = `${visibilityValue / 1000} km`;

    humidityValue.textContent = `${humidity}%`;

    sunrise.textContent = getTimeFormat(sunriseTimestamp);

    sunset.textContent = getTimeFormat(sunsetTimestamp);

    windSpeed.textContent = `${windSpeedValue} m/s`;

    weatherSummaryImg.src = `assets/svg/${getWeatherIcon(id)}`;

    setWeatherBackground(id);

    await updateHourlyForecast(city)
    await updateDaysForecastInfo(city)
    showDisplaySection(weatherInfoSection)
}

// FUNCTION TO UPDATE HOURLY FORECAST

async function updateHourlyForecast(city) {
    const hourlyForecastData = await getFetchData("forecast", city)

    const now = Date.now()
    const endTime = now + 24 * 60 * 60 * 1000

    hourlyForecastContainer.innerHTML = ""

    hourlyForecastData.list.forEach(forecastWeather => {
        const forecastTime = forecastWeather.dt * 1000

        if (forecastTime >= now && forecastTime <= endTime) {
            const {
                weather: [{id}],
                main: {temp}
            } = forecastWeather

            const time = getTimeFormat(forecastWeather.dt)

            const hourlyForecastItem = `
                <div class="hourly-forecast-item">
                    <h5 class="hour-forecast-time">${time}</h5>
                    <h5 class="hour-forecast-temp">${Math.round(temp)}&deg;C</h5>
                    <img src="assets/svg/${getWeatherIcon(id)}" class="hour-forecast-img">
                </div>
            `

            hourlyForecastContainer.insertAdjacentHTML("beforeend", hourlyForecastItem)
        }
    });
}

// FUNCTION TO UPDATE 5 DAYS FORECAST

async function updateDaysForecastInfo(city) {
    const daysForecastData = await getFetchData("forecast", city)
    
    const timeTaken = "12:00:00"
    const todayDate = new Date().toISOString().split("T")[0]

    daysForecastContainer.innerHTML = ""
    daysForecastData.list.forEach(forecastWeather => {
        if (forecastWeather.dt_txt.includes(timeTaken) ) {
            updateDaysForecastItem(forecastWeather)
        }
    })
}

function updateDaysForecastItem(weatherData) {
    const {
        dt_txt: date,
        weather: [{id}],
        main: {temp}
    } = weatherData

    const dateTaken = new Date(date)
    const dateOption = {
        day: "2-digit",
        month: "short"
    }
    const dateResult = dateTaken.toLocaleDateString("en-US", dateOption)

    const dayResult = getWeekDay(date)

    const daysForecastItem = `
        <div class="days-forecast-item">
            <h5 class="days-forecast-day">${dayResult}</h5>
            <h5 class="days-forecast-date">${dateResult}</h5>
            <h5 class="days-forecast-temp">${Math.round(temp)} °C</h5>
            <img src="assets/svg/${getWeatherIcon(id)}" class="days-forecast-img">
        </div>
    `

    daysForecastContainer.insertAdjacentHTML("beforeend", daysForecastItem)
}

// DISPLAY FUNCTION

function showDisplaySection(section) {
    [weatherInfoSection, searchCitySection, notFoundSection]
        .forEach(section => section.style.display ="none")

    if (section === weatherInfoSection) {
        section.style.display = "grid"
    } else if (section === searchCitySection || section === notFoundSection) {
        section.style.display = "flex"
    }
}