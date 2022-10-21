export default class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;
    this.view.bindSearch(this.handleSearch);
    this.model.bindCardsChanged(this.onCardsChanged);

    this.onCardsChanged(this.model.cards);
  }

  onCardsChanged = (cards) => {
    this.view.drawCards(cards);
  };

  handleSearch = (city) => {
    this.model
      .fetchWeather(city)
      .then((data) => {
        const result = this.model.cards.find(
          (element) => element.id === data.city.toLowerCase()
        );
        result ? this.model.updateCard(result, data) : this.model.addCard(data);
        console.log(this.model.cards);
      })
      .catch((e) => {
        console.log(this.model.cards, e);
      });
  };
}
