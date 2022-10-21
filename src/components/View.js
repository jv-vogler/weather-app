export default class View {
  constructor() {
    this.grid = this._getElement(".cards-grid");
    this.searchBar = this._getElement(".search--bar");
    this.searchBtn = this._getElement(".search--btn");
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
          <p class="temperature">${data.temp}ºC</p>
          <p class="feels-like">${data.feelsLike}ºC</p>
          <p class="weather-description">${data.weather}</p>
          <p class="min">${data.tempMin}ºC</p>
          <p class="max">${data.tempMax}ºC</p>
          <p class="humidity">${data.humidity}%</p>
          <p class="wind">${data.wind}m/s</p>
          <p class="timestamp">${data.timestamp}</p>
        </div>`;
        const card = this._elementFromHtml(cardHtml);

        const favoriteBtn = this._createElement("i", "fa-solid fa-star favorite-btn");
        const closeBtn = this._createElement("i", "fa-solid fa-xmark close-btn");
        closeBtn.addEventListener("click", e => {
          this.deleteCard(data.id);
        });
        const refreshBtn = this._createElement("i", "fa-solid fa-arrows-rotate refresh-btn");
        refreshBtn.addEventListener("click", e => {
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
    this.searchBtn.addEventListener("click", event => {
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
