export default class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;
    this.view.bindSearch(this.handleSearch);
    this.view.bindUpdate(this.handleSearch);
    this.view.bindDelete(this.handleDelete);
    this.model.bindCardsChanged(this.onCardsChanged);

    this.onCardsChanged(this.model.cards);
  }

  onCardsChanged = (cards) => {
    this.view.drawCards(cards);
  };

  handleDelete = (id) => {
    this.model.deleteCard(id);
  };

  handleSearch = (city) => {
    this.model
      .fetchWeather(city)
      .then((data) => {
        const existingCity = this.model.cards.find(
          (element) => element.id === data.city.toLowerCase()
        );
        existingCity
          ? this.model.updateCard(existingCity, data)
          : this.model.addCard(data);
      })
      .catch((e) => {
        alert("Invalid name");
      });
  };
}
