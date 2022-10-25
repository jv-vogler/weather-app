export default class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;
    this.view.setupButtons(this.model.settings);
    this.view.bindSearch(this.handleSearch);
    this.view.bindUpdate(this.handleSearch);
    this.view.bindDelete(this.handleDelete);
    this.view.bindTempToggle(this.handleTempToggle);
    this.view.bindTimeToggle(this.handleTimeToggle);
    this.view.bindLanguageToggle(this.handleLangToggle);
    this.model.bindCardsChanged(this.onCardsChanged);
    this.model.bindLangChanged(this.onLangChanged);

    this.onCardsChanged(this.model.cards);
    this.onLangChanged(this.model.settings.language);
  }

  onCardsChanged = (cards) => {
    this.view.drawCards(cards);
  };

  onLangChanged = (lang) => {
    this.view.applyLanguage(lang);
  };

  handleDelete = (id) => {
    this.model.deleteCard(id);
  };

  handleTempToggle = () => {
    this.model.toggleTemperature();
  };

  handleTimeToggle = () => {
    this.model.toggleTimeFormat();
  };

  handleLangToggle = () => {
    this.model.toggleLanguage();
  };

  handleSearch = (city) => {
    this.model
      .fetchWeather(city)
      .then((data) => {
        const cardExists = this.model.cards.find(
          (element) => element.id === data.id
        );
        cardExists
          ? this.model.updateCard(cardExists, data)
          : this.model.addCard(data);
      })
      .catch((e) => {
        alert("Invalid name"); // TODO
      });
  };
}
