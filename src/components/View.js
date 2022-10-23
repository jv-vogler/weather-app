export default class View {
  constructor() {
    this.grid = this._getElement(".cards-grid");
    this.searchBar = this._getElement(".search--bar");
    this.searchBtn = this._getElement(".search--btn");
    this.toggleTempBtn = this._getElement("#toggle-temp");
    this.toggleTimeBtn = this._getElement("#toggle-time");
    this.toggleLangBtn = this._getElement("#toggle-lang");
    this.tempScale = this._getElement(".temp-scale");
    this._setupHamburgerMenu();
  }

  drawCards(cards) {
    while (this.grid.firstChild) {
      this.grid.removeChild(this.grid.firstChild);
    }
    if (cards.length === 0) {
      // pass
    } else {
      cards.forEach((data) => {
        const cardHtml = `
        <div class="card">
          <p class="city-name">${data.city}, ${data.country}</p>
          <p class="temperature">${data.temp}<span class="temp-scale">ºC</span></p>
          <p class="feels-like">Sensação: ${data.feelsLike}<span class="temp-scale">ºC</span></p>
          <p class="weather-description">${data.weather}</p>
          <img class="icon" src="https://openweathermap.org/img/wn/${data.icon}@2x.png">
          <p class="max"><i class="fa-solid fa-temperature-arrow-up"></i> ${data.tempMax}<span class="temp-scale">ºC</span></p>
          <p class="min"><i class="fa-solid fa-temperature-arrow-down"></i> ${data.tempMin}<span class="temp-scale">ºC</span></p>
          <p class="humidity"><i class="fa-solid fa-droplet"></i> ${data.humidity} %</p>
          <p class="wind"><i class="fa-solid fa-wind"></i> ${data.wind} m/s</p>
          <p class="timestamp">${data.timestamp}</p>
        </div>`;
        const card = this._elementFromHtml(cardHtml);
        const favoriteBtn = this._createElement(
          "i",
          "fa-solid fa-star favorite-btn"
        );
        const closeBtn = this._createElement(
          "i",
          "fa-solid fa-xmark close-btn"
        );
        closeBtn.addEventListener("click", (e) => {
          this.deleteCard(data.id);
        });
        const refreshBtn = this._createElement(
          "i",
          "fa-solid fa-arrows-rotate refresh-btn"
        );
        refreshBtn.addEventListener("click", (e) => {
          this.updateCard(data.id);
        });

        card.append(favoriteBtn, closeBtn, refreshBtn);
        this.grid.appendChild(card);
      });
    }
  }

  bindDelete(handler) {
    this.deleteCard = handler;
  }

  bindUpdate(handler) {
    this.updateCard = handler;
  }

  bindSearch(handler) {
    this.searchBtn.addEventListener("click", (event) => {
      event.preventDefault();

      if (this._cityQuery) {
        handler(this._cityQuery);
        this._resetInput();
      }
    });
  }

  get _cityQuery() {
    return this.searchBar.value;
  }

  _resetInput() {
    this.searchBar.value = "";
  }

  _elementFromHtml(html) {
    const template = document.createElement("template");
    template.innerHTML = html.trim();

    return template.content.firstElementChild;
  }

  _createElement(tag, classes = "", dataKey = null) {
    const element = document.createElement(tag);
    if (classes) {
      classes
        .split(" ")
        .forEach((className) => element.classList.add(className));
    }
    if (dataKey) element.setAttribute("data-key", dataKey);

    return element;
  }

  _getElement(selector) {
    const element = document.querySelector(selector);

    return element;
  }

  _setupHamburgerMenu() {
    const hamburger = this._getElement(".hamburger");
    const navMenu = this._getElement(".nav-menu");

    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active");
      navMenu.classList.toggle("active");
    });
  }
}