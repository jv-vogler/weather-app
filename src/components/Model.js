export default class Model {
  constructor() {
    this.API_KEY = "812725e17f5e8632a2a379e3eba9eef7";
    this.favorites = [];
    this.cards = JSON.parse(localStorage.getItem("cards")) || [];
    this.settings = JSON.parse(localStorage.getItem("settings")) || {
      tempScale: "ºC",
      timeFormat: "24h",
      language: "pt_br",
    };
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
        tempScale: this.settings.tempScale,
        //? localNames
        //? weatherCode: cityWeather.weather[0].id,
      };
      // console.log(cityWeather);
      return result;
    } catch (e) {
      console.error(e); // TODO
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
      tempScale: data.tempScale,
      //? localNames: data.localNames,
    };
    this.cards.unshift(card);
    this._commit(this.cards);
  }

  deleteCard(id) {
    this.cards = this.cards.filter((card) => card.id !== id);
    this._commit(this.cards);
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
    card.tempScale = data.tempScale;
    this._commit(this.cards);
  }

  toggleTemperature() {
    this.settings.tempScale === "ºF"
      ? (this.settings.tempScale = "ºC")
      : (this.settings.tempScale = "ºF");
    this.cards.forEach((card) => {
      card.temp = this._convertTemperature(card.temp);
      card.tempMin = this._convertTemperature(card.tempMin);
      card.tempMax = this._convertTemperature(card.tempMax);
      card.feelsLike = this._convertTemperature(card.feelsLike);
      card.tempScale = this.settings.tempScale;
    });
    this._commit(this.cards);
  }

  toggleTimeFormat() {
    this.settings.timeFormat === "24h"
      ? (this.settings.timeFormat = "12h")
      : (this.settings.timeFormat = "24h");
    this.cards.forEach((card) => {
      card.timestamp = this._convertTimeFormat(card.timestamp);
    });
    this._commit(this.cards);
  }

  toggleLanguage() {
    this.settings.language === "en"
      ? (this.settings.language = "pt_br")
      : (this.settings.language = "en");
    //TODO - update description & local city name
    this._commit(this.cards);
  }

  bindCardsChanged(callback) {
    this.onCardsChanged = callback;
  }

  bindLangChanged(callback) {
    this.onLangChanged = callback;
  }

  //* Private Methods / Métodos Privados
  _convertTemperature(temperature) {
    if (this.settings.tempScale === "ºC") {
      return Math.round(this._convertToC(temperature));
    } else {
      return Math.round(this._convertToF(temperature));
    }
  }

  _convertToF(temperature) {
    //* 32 -> 89.6
    return Math.round((temperature * 1.8 + 32) * 10) / 10;
  }

  _convertToC(temperature) {
    //* 70 -> 21.1
    return Math.round((temperature - 32) * 0.5556 * 10) / 10;
  }

  _getTemperature(temperature) {
    if (this.settings.tempScale === "ºF") {
      return Math.round(this._convertToF(temperature));
    } else {
      return Math.round(temperature);
    }
  }

  _convertTimeFormat(timestamp) {
    if (this.settings.timeFormat === "24h") {
      return this._convertTo24h(timestamp);
    } else {
      return this._convertTo12h(timestamp);
    }
  }

  _convertTo24h(time) {
    //* 11:30 PM -> 23:30
    const hrs = parseInt(time.slice(0, 2));
    const mins = time.slice(3, 5);
    const am_pm = time.slice(-2);

    if (am_pm === "PM" && hrs === 12) return `00:${mins}`;
    if (am_pm === "PM" && hrs < 12)
      return `${(hrs + 12).toString().padStart(2, "0")}:${mins}`;
    if (hrs < 13) return `${hrs.toString().padStart(2, "0")}:${mins}`;
  }

  _convertTo12h(time) {
    //* 23:30 -> 11:30 PM
    const hrs = parseInt(time.slice(0, 2));
    const mins = time.slice(-2);

    if (hrs === 0) return `12:${mins} PM`;
    if (hrs < 13) return `${hrs.toString().padStart(2, "0")}:${mins} AM`;
    if (hrs < 24) return `${(hrs - 12).toString().padStart(2, "0")}:${mins} PM`;
  }

  _getTimestamp(timestamp) {
    if (this.settings.timeFormat === "12h") {
      return this._convertTo12h(timestamp);
    } else {
      return timestamp;
    }
  }

  _getLocalTime(offset) {
    const date = Date.now();
    const localTime = new Date(date + offset * 1000);
    const hrs = localTime.getUTCHours().toString().padStart(2, "0");
    const mins = localTime.getUTCMinutes().toString().padStart(2, "0");
    const timestamp = this._getTimestamp(`${hrs}:${mins}`);

    return timestamp;
  }

  _getCityName(name, local_names) {
    // TODO - test
    if (local_names && local_names.pt && this.settings.language === "pt-br")
      return local_names.pt;
    if (local_names && local_names.en && this.settings.language === "en")
      return local_names.en;
    return name;
  }

  _getWeatherDescription(weather) {
    //! Not sure
    if (this.settings.language === "pt-br")
      return this._capitalize(weather.description);
    switch (weather.id) {
      case 200:
        return "Thunderstorm with light rain";
      case 201:
        return "Thunderstorm with rain";
      case 202:
        return "Thunderstorm with heavy rain";
      case 210:
        return "Light thunderstorm";
      case 211:
        return "Thunderstorm";
      case 212:
        return "Heavy thunderstorm";
      case 221:
        return "Ragged thunderstorm";
      case 230:
        return "Thunderstorm with light drizzle";
      case 231:
        return "Thunderstorm with drizzle";
      case 232:
        return "Thunderstorm with heavy drizzle";
    }
  }

  _capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  _commit(cards) {
    this.onCardsChanged(cards);
    this.onLangChanged(this.settings.language);
    localStorage.setItem("cards", JSON.stringify(cards));
    localStorage.setItem("settings", JSON.stringify(this.settings));
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
