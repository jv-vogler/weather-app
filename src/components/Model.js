import { getEnglishDescription } from "./utils";

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
        city: this._getCityNames(cityWeather.name, geoData), //* original city name
        country: geoData.country,
        feelsLike: this._getTemperature(cityWeather.main.feels_like),
        humidity: cityWeather.main.humidity,
        icon: cityWeather.weather[0].icon,
        temp: this._getTemperature(cityWeather.main.temp),
        tempMin: this._getTemperature(cityWeather.main.temp_min),
        tempMax: this._getTemperature(cityWeather.main.temp_max),
        tempScale: this.settings.tempScale,
        timestamp: this._getLocalTime(cityWeather.timezone),
        timezone: cityWeather.timezone,
        weather: this._getWeatherDescriptions(cityWeather.weather[0]),
        wind: Math.floor(cityWeather.wind.speed * 10) / 10,
      };
      return result;
    } catch (e) {
      console.error(e); // TODO
    }
  }

  addCard(data) {
    const card = {
      id: data.id,
      city: data.city,
      country: data.country,
      feelsLike: data.feelsLike,
      humidity: data.humidity,
      icon: data.icon,
      temp: data.temp,
      tempMin: data.tempMin,
      tempMax: data.tempMax,
      tempScale: data.tempScale,
      timestamp: data.timestamp,
      timezone: data.timezone,
      weather: data.weather,
      wind: data.wind,
    };
    this.cards.unshift(card);
    this._commit(this.cards);
  }

  deleteCard(id) {
    this.cards = this.cards.filter((card) => card.id !== id);
    this._commit(this.cards);
  }

  updateCard(card, data) {
    card.city = data.city;
    card.feelsLike = data.feelsLike;
    card.humidity = data.humidity;
    card.icon = data.icon;
    card.temp = data.temp;
    card.tempMin = data.tempMin;
    card.tempMax = data.tempMax;
    card.tempScale = data.tempScale;
    card.timestamp = data.timestamp;
    card.timezone = data.timezone;
    card.weather = data.weather;
    card.wind = data.wind;
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
    this.settings.language === "pt_br"
      ? (this.settings.language = "en")
      : (this.settings.language = "pt_br");

    this.cards.forEach((card) => {
      //* City names
      if (card.city.alt) {
        const name = card.city.name;
        card.city.name = card.city.alt;
        card.city.alt = name;
      }
      //* Weather descriptions
      const description = card.weather.description;
      card.weather.description = card.weather.alt;
      card.weather.alt = description;
    });
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

  _getCityNames(defaultName, data) {
    if (!data.local_names) return { name: defaultName || data.name };

    const city = { name: null, alt: null };
    if (this.settings.language === "pt_br") {
      city.name = data.local_names.pt || defaultName || data.name;
      city.alt = data.local_names.en;
    } else if (this.settings.language === "en") {
      city.name = data.local_names.en || defaultName || data.name;
      city.alt = data.local_names.pt;
    }
    return city;
  }

  _getWeatherDescriptions(data) {
    if (this.settings.language === "pt_br")
      return {
        description: this._capitalize(data.description),
        alt: getEnglishDescription(data.id),
      };
    if (this.settings.language === "en")
      return {
        description: getEnglishDescription(data.id),
        alt: this._capitalize(data.description),
      };
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
