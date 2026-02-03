import { setupNavigation } from "./navigation.js";
import { setupEventListeners } from "./eventHandlers.js";
import { setupFormHandlers } from "./formHandlers.js";

document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  setupEventListeners();
  setupFormHandlers();

  console.log("Admin dashboard initialized successfully!");
});
