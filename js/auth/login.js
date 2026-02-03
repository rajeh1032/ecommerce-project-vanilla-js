// js/auth/login.js
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "../config/firebase.js";

// Elements
const loginEmail = document.getElementById("loginEmailField");
const loginPassword = document.getElementById("loginPasswordField");
const loginSubmitBtn = document.getElementById("loginSubmitBtn");

const registerEmail = document.getElementById("registerEmailFiled");
const registerPassword = document.getElementById("registerPasswordFiled");
const registerSubmitBtn = document.getElementById("registerSubmitBtn");

// LOGIN
loginSubmitBtn.addEventListener("click", (e) => {
  e.preventDefault();

  signInWithEmailAndPassword(auth, loginEmail.value, loginPassword.value)
    .then((userCredential) => {
      console.log("Logged in:", userCredential.user);
      // Redirect to dashboard or home page
      window.location.href = "../public/index.html";
    })
    .catch((error) => {
      alert(error.message);
    });
});

// REGISTER
registerSubmitBtn.addEventListener("click", (e) => {
  e.preventDefault();

  createUserWithEmailAndPassword(
    auth,
    registerEmail.value,
    registerPassword.value,
  )
    .then((userCredential) => {
      console.log("User created:", userCredential.user);
      // Redirect to dashboard or home page
      window.location.href = "/dashboard.html";
    })
    .catch((error) => {
      alert(error.message);
    });
});

// Login - Signup animation
let loginBtn = document.getElementById("loginBtn");
let registerBtn = document.getElementById("registerBtn");
let loginContainer = document.getElementById("login");
let registerContainer = document.getElementById("register");

function login() {
  loginContainer.style.left = "4px";
  registerContainer.style.right = "-520px";
  loginBtn.className = "btn white-btn";
  registerBtn.className = "btn";
  loginContainer.style.opacity = 1;
  registerContainer.style.opacity = 0;
}

function register() {
  loginContainer.style.left = "-510px";
  registerContainer.style.right = "5px";
  loginBtn.className = "btn";
  registerBtn.className = "btn white-btn";
  loginContainer.style.opacity = 0;
  registerContainer.style.opacity = 1;
}

// Make functions global for onclick handlers
window.login = login;
window.register = register;
