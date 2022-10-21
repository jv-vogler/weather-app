export default class Model {
  constructor() {
    this.favorites = [];
    this.cards = [
      {
        city: "Curitiba",
        country: "BR",
        feelsLike: 14.89,
        humidity: 71,
        icon: "10n",
        id: "curitiba",
        temp: 15.46,
        tempMin: 15.05,
        tempMax: 16.49,
        timezone: -10800,
        timestamp: "11:23 am",
        weather: "chuva leve",
        wind: 1.79,
      },
    ];
    this.API_KEY = "812725e17f5e8632a2a379e3eba9eef7";
  }

  async fetchWeather(city) {
    try {
      const geoData = await this._getGeoLocation(city);
      const cityWeather = await this._getWeatherData(geoData);
      const result = {
        id: geoData.name.toLowerCase(),
        temp: cityWeather.main.temp,
        tempMin: cityWeather.main.temp_min,
        tempMax: cityWeather.main.temp_max,
        feelsLike: cityWeather.main.feels_like,
        humidity: cityWeather.main.humidity,
        wind: cityWeather.wind.speed,
        weather: cityWeather.weather[0].description,
        icon: cityWeather.weather[0].icon,
        timezone: cityWeather.timezone,
        timestamp: this._getHours(cityWeather.timezone),
        country: cityWeather.sys.country,
        city: geoData.name,
        localNames: geoData.local_names,
      };
      return result;
    } catch (e) {
      console.error("Invalid city name", e);
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
    this.cards.push(card);
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

  favoriteCard(id) {
    console.log("favorited card");
  }

  bindCardsChanged(callback) {
    this.onCardsChanged = callback;
  }

  _getHours(offset) {
    const date = new Date();
    const seconds = (date.getUTCHours() * 60 + date.getUTCMinutes()) * 60 + offset;
    const hrs = Math.floor(seconds / 3600).toString().padStart(2, "0");
    const mins = Math.floor(seconds % 3600 / 60).toString().padStart(2, "0");

    return `${hrs}:${mins}`;
  }

  async _getGeoLocation(city) {
    const response = await fetch(
      `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${this.API_KEY}`
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
