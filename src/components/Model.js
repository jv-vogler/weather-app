export default class Model {
  constructor() {
    this.favorites = [];
    this.cards = [
      // {
      //   city: "Florianópolis",
      //   country: "BR",
      //   feelsLike: 22,
      //   humidity: 71,
      //   icon: "11d",
      //   id: "curitiba",
      //   temp: 15,
      //   tempMax: 23,
      //   tempMin: 16,
      //   timezone: -10800,
      //   timestamp: "11:23",
      //   weather: "Chuva leve",
      //   wind: 1.7,
      // },
    ];
    this.API_KEY = "812725e17f5e8632a2a379e3eba9eef7";
    this.fahrenheit = false;
    this.am_pm = false;
  }

  async fetchWeather(city) {
    try {
      const geoData = await this._getGeoLocation(city);
      const cityWeather = await this._getWeatherData(geoData);
      const result = {
        id: geoData.name.toLowerCase(),
        temp: this._getTemperature(cityWeather.main.temp),
        tempMin: this._getTemperature(cityWeather.main.temp_min),
        tempMax: this._getTemperature(cityWeather.main.temp_max),
        feelsLike: this._getTemperature(cityWeather.main.feels_like),
        humidity: cityWeather.main.humidity,
        wind: Math.floor(cityWeather.wind.speed * 10) / 10,
        weather: this._capitalize(cityWeather.weather[0].description),
        icon: cityWeather.weather[0].icon,
        timezone: cityWeather.timezone,
        timestamp: this._getLocalTime(cityWeather.timezone),
        country: cityWeather.sys.country,
        city: this._getCityName(cityWeather.name, geoData.local_names),
      };
      return result;
    } catch (e) {
      console.error(e);
    }
  }

  addCard(data) {
    const card = {
      id: data.id,
      temp: data.temp,
      tempMin: data.tempMin,
      tempMax: data.tempMax,
      feelsLike: data.feelsLike,
      humidity: data.humidity,
      wind: data.wind,
      weather: data.weather,
      icon: data.icon,
      timezone: data.timezone,
      timestamp: data.timestamp,
      country: data.country,
      city: data.city,
      localNames: data.localNames,
    };
    this.cards.unshift(card);
    this.onCardsChanged(this.cards);
  }

  deleteCard(id) {
    this.cards = this.cards.filter((card) => card.id !== id);
    this.onCardsChanged(this.cards);
  }

  updateCard(card, data) {
    card.temp = data.temp;
    card.tempMin = data.tempMin;
    card.tempMax = data.tempMax;
    card.feelsLike = data.feelsLike;
    card.humidity = data.humidity;
    card.wind = data.wind;
    card.weather = data.weather;
    card.icon = data.icon;
    card.timezone = data.timezone;
    card.timestamp = data.timestamp;
    this.onCardsChanged(this.cards);
  }

  bindCardsChanged(callback) {
    this.onCardsChanged = callback;
  }

  toggleTemperature() {
    const toggleBtn = document.querySelector("#toggle-temp");
    this.cards.forEach((card) => {
      toggleBtn.checked
        ? (card.temp = this._convertToF(card.temp))
        : (card.temp = this._convertToC(card.temp));
    });
    this.onCardsChanged(this.cards);
  }

  toggleLanguage() {
    //
  }

  toggleTime() {
    const toggleBtn = document.querySelector("#toggle-time");
    this.cards.forEach((card) => {
      toggleBtn.checked
        ? (card.timestamp = this._convertToAmPm(card.timestamp))
        : (card.timestamp = this._convertTo24h(card.timestamp));
    });
    this.onCardsChanged(this.cards);
  }

  _getCityName(name, local_names) {
    if (local_names.pt) {
      return local_names.pt;
    } else if (local_names.en) {
      return local_names.en;
    } else return name;
  }

  _getTemperature(temperature) {
    if (this.fahrenheit) {
      return Math.round(this._convertToF(temperature));
    } else {
      return Math.round(temperature);
    }
  }

  _convertToF(temperature) {
    // 32 -> 89.6
    return Math.round((temperature * 1.8 + 32) * 10) / 10;
  }

  _convertToC(temperature) {
    // 70 -> 21.1
    return Math.round((temperature - 32) * 0.5556 * 10) / 10;
  }

  _getTimestamp(timestamp) {
    if (this.am_pm) {
      return this._convertToAmPm(timestamp);
    } else {
      return timestamp;
    }
  }

  _convertTo24h(time) {
    // 11:30 PM -> 23:30
    const hrs = parseInt(time.slice(0, 2));
    const mins = time.slice(3, 5);
    const am_pm = time.slice(-2);

    if (am_pm === "PM" && hrs === 12) return `00:${mins}`;
    if (am_pm === "PM" && hrs < 12)
      return `${(hrs + 12).toString().padStart(2, "0")}:${mins}`;
    if (hrs < 13) return `${hrs.toString().padStart(2, "0")}:${mins}`;
  }

  _convertToAmPm(time) {
    // 23:30 -> 11:30 PM
    const hrs = parseInt(time.slice(0, 2));
    const mins = time.slice(-2);

    if (hrs === 0) return `12:${mins} PM`;
    if (hrs < 13) return `${hrs.toString().padStart(2, "0")}:${mins} AM`;
    if (hrs < 24) return `${(hrs - 12).toString().padStart(2, "0")}:${mins} PM`;
  }

  _capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  _getLocalTime(offset) {
    const date = Date.now();
    const localTime = new Date(date + offset * 1000);
    const hrs = localTime.getUTCHours().toString().padStart(2, "0");
    const mins = localTime.getUTCMinutes().toString().padStart(2, "0");

    return `${hrs}:${mins}`;
  }

  async _getGeoLocation(city) {
    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${this.API_KEY}`
    );
    const location = await response.json();

    return location[0];
  }

  async _getWeatherData(coordinates) {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.API_KEY}&units=metric&lang=pt_br`
    );
    const weatherData = await response.json();

    return weatherData;
  }
}
