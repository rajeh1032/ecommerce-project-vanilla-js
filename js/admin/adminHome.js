import { setupNavigation } from "./navigation.js";
import { setupEventListeners } from "./eventHandlers.js";
import { setupFormHandlers } from "./formHandlers.js";
import { signOut, auth, onAuthStateChanged } from "../config/firebase.js";

document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  setupEventListeners();
  setupFormHandlers();

  console.log("Admin dashboard initialized successfully!");
});

onAuthStateChanged(auth, (user) => {
  if (!user) {
    localStorage.clear();
    window.location.replace("../public/login.html");
  }
});

export async function logoutAdminBoard() {
  try {
    await signOut(auth);
    localStorage.clear();
    window.location.replace("../public/login.html");
  } catch (error) {
    console.error("Logout error:", error);
  }
}

window.logoutAdminBoard = logoutAdminBoard;
