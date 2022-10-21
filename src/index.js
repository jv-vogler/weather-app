import Controller from "./components/Controller";
import Model from "./components/Model";
import View from "./components/View";
import "./style.css";

document.addEventListener("DOMContentLoaded", () => {
  const app = new Controller(new Model(), new View());
});
