import { setupNavigation } from "./navigation.js";
import { setupEventListeners } from "./eventHandlers.js";
import { setupFormHandlers } from "./formHandlers.js";
import { signOut, auth } from "../config/firebase.js";

document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  setupEventListeners();
  setupFormHandlers();

  console.log("Admin dashboard initialized successfully!");
});

export function logoutAdminBoard() {
  signOut(auth)
    .then(() => {
      window.location.href = "../public/login.html";
    })
    .catch((error) => {
      console.error("Logout error:", error);
    });
}

window.logoutAdminBoard = logoutAdminBoard;
