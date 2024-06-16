const search = document.getElementById("search-city");
const demo = document.getElementById("show-data");
const carousel = document.getElementById("btns");
search.addEventListener("input", function () {
  searchValue = search.value;
  getData(searchValue);
});

function getData(value) {
  demo.innerHTML = `<span class="loader "></span>`;
  carousel.classList.remove("active");
  if (value.length >= 3) {
    getWeather(value)
      .then((resolve) => {
        if (resolve.location) {
          carousel.classList.add("active");
          display(resolve);
        } else {
          carousel.classList.remove("active");
          demo.innerHTML = `<img class="w-100 mt-5" src="images/404.png" alt="Not Found"> `;
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }
}

async function getWeather(city) {
  let req = await fetch(
    `https://api.weatherapi.com/v1/forecast.json?key=7fcb5d4704024c898ae33930241406&q=${city}&days=3`
  );

  let data = await req.json();
  return data;
}

function getDateTime(dateTime) {
  let date = new Date(dateTime);
  const dayOfWeek = date.toLocaleString("en-us", { weekday: "long" });
  const month = date.toLocaleString("default", {
    month: "long",
  });
  let day = date.getDate();
  let dateData = {
    day: day,
    dayOfWeek: dayOfWeek,
    month: month,
  };
  return dateData;
}

function show(activeState, ...weatherInfo) {
  let [
    icon,
    day,
    month,
    dayOfWeek,
    name,
    temp_c = "",
    text,
    wind,
    avghumidity,
    maxtemp_c = "",
    mintemp_c = "",
  ] = weatherInfo;
  let weatherState = [
    "Mist",
    "Cloudy",
    "Clear",
    "Partlycloudy",
    "Patchyrainnearby",
    "Sunny",
  ];
  let currentWeather = text.replaceAll(" ", "");

  let data = `<div class="carousel-item ${activeState}" >
    <div class="wheather">
        <div class="wheather-box">
            <img class="position-absolute weather-icon"
                src="${icon}" alt="weather">
            <p class="position-absolute text-white start-0 date">${day}<span>/${month}</span>
            <p class="position-absolute text-white py-5 day">${dayOfWeek}
            </p>
            <div class="box text-center">
                <div class="wheather-info text-white">
                    <h3 class="mt-4">${name}</h3>
                    <img src="images/${
                      weatherState.includes(currentWeather)
                        ? currentWeather
                        : "Partlycloudy"
                    }.png" class="forecast-icon w-75 mt-2" alt="weather icon">
                    ${
                      activeState != "active"
                        ? `    <p class="temperature position-relative mb-0">${maxtemp_c}<span
                                                    class="position-absolute">°C</span></p>
                                            <p class="temperature-lower m-0 p-0">${mintemp_c}o</p>`
                        : ""
                    }
                    ${
                      activeState == "active"
                        ? `<p class="temperature position-relative mt-4 mb-0">${temp_c}<span
                            class="position-absolute">°C</span></p>`
                        : ""
                    }
                 
                    <p class="description">${text}</p>
                </div>
            </div>
        </div>
        <div class="wheather-details d-flex justify-content-between text-white">
            <div class="humidity d-flex align-items-center gap-2">
                <i class="details-icon fa-solid fa-water"></i>
                <div>
                    <div class="text">
                        <span>${avghumidity}/Avg</span>
                    </div>
                    <p class="m-0">Humidity</p>
                </div>
            </div>
            <div class="wind d-flex align-items-center gap-2">
                <i class="details-icon fa-solid fa-wind"></i>
                <div>
                    <div class="text">
                        <span>${wind}Km/h</span>
                    </div>
                    <p class="m-0">Wind Speed</p>
                </div>
            </div>
        </div>
    </div>
</div>`;

  return data;
}

function currentDay(current, location) {
  let currentDate = getDateTime(current.last_updated);
  let { day, month, dayOfWeek } = currentDate;
  let {
    condition: { text, icon },
    temp_c,
  } = current;
  let { wind_mph: wind, humidity } = current;
  let { name } = location;
  let data = show(
    "active",
    icon,
    day,
    month,
    dayOfWeek,
    name,
    temp_c,
    text,
    wind,
    humidity
  );

  demo.innerHTML = data;
}

function display(weather) {
  let {
    forecast: { forecastday },
    current,
    location,
  } = weather;
  let { name } = location;

  currentDay(current, location);

  let box = ``;
  for (let i = 1; i < forecastday.length; i++) {
    let {
      day: {
        condition: { text, icon },
        maxtemp_c,
        mintemp_c,
      },
    } = forecastday[i];
    let currentDate = getDateTime(forecastday[i].date);
    let { day, month, dayOfWeek } = currentDate;
    let { maxwind_kph: wind, avghumidity } =
      weather.forecast.forecastday[i].day;

    let data = show(
      "",
      icon,
      day,
      month,
      dayOfWeek,
      name,
      "",
      text,
      wind,
      avghumidity,
      maxtemp_c,
      mintemp_c
    );
    box += data;
  }

  demo.innerHTML += box;
}

const successCallback = (position) => {
  var api_key = "d9d746a7abfb4ef486d238fd2a5c3004";
  let latitude = position.coords.latitude;
  let longitude = position.coords.longitude;
  var query = latitude + "," + longitude;

  var api_url = "https://api.opencagedata.com/geocode/v1/json";

  var request_url =
    api_url +
    "?" +
    "key=" +
    api_key +
    "&q=" +
    encodeURIComponent(query) +
    "&pretty=1" +
    "&no_annotations=1";
  var request = new XMLHttpRequest();
  request.open("GET", request_url, true);

  request.onload = function () {
    if (request.status === 200) {
      var data = JSON.parse(request.responseText);
      let location = data.results[0].components.country;
      getData(location);
      return location;
    } else if (request.status <= 500) {
      console.log("unable to geocode! Response code: " + request.status);
      var data = JSON.parse(request.responseText);
      console.log("error msg: " + data.status.message);
    } else {
      console.log("server error");
    }
  };

  request.onerror = function () {
    console.log("unable to connect to server");
  };

  request.send();
};

const errorCallback = (error) => {
  console.log(error);
};
navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
