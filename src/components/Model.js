export default class Model {
  constructor() {
    this.favorites = [];
    this.cards = [
      {
      city: "Curitiba",
      country: "BR",
      feelsLike: 288.07,
      humidity: 71,
      icon: "10n",
      id: "curitiba",
      temp: 288.61,
      tempMax: 289.64,
      tempMin: 288.2,
      timezone: -10800,
      weather: "chuva leve",
      wind : 1.79
    }
    ];
    this.API_KEY = "812725e17f5e8632a2a379e3eba9eef7";
  }

  async fetchWeather(city) {
    try {
      const cityWeather = await this._getWeatherData(
        await this._getGeoLocation(city)
      );
      const result = {
        temp: cityWeather.main.temp,
        tempMin: cityWeather.main.temp_min,
        tempMax: cityWeather.main.temp_max,
        feelsLike: cityWeather.main.feels_like,
        humidity: cityWeather.main.humidity,
        wind: cityWeather.wind.speed,
        weather: cityWeather.weather[0].description,
        icon: cityWeather.weather[0].icon,
        timezone: cityWeather.timezone,
        country: cityWeather.sys.country,
        city: city,
      };
      return result;
    } catch (e) {
      console.error("Invalid city name", e);
    }
  }

  addCard(data) {
    const card = {
      id: data.city.toLowerCase(),
      city: data.city,
      temp: data.temp,
      tempMin: data.tempMin,
      tempMax: data.tempMax,
      feelsLike: data.feelsLike,
      humidity: data.humidity,
      wind: data.wind,
      weather: data.weather,
      icon: data.icon,
      timezone: data.timezone,
      country: data.country,
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
    card.country = data.country;
    this.onCardsChanged(this.cards);
  }

  favoriteCard(id) {
    console.log("favorited card");
  }

  bindCardsChanged(callback) {
    this.onCardsChanged = callback;
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
      `https://api.openweathermap.org/data/2.5/weather?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.API_KEY}&lang=pt_br`
    );
    const weatherData = await response.json();

    return weatherData;
  }
}
