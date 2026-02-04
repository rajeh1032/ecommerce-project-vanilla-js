// js/auth/login.js
import {
  auth,
  db,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "../config/firebase.js";

// Elements
const loginEmail = document.getElementById("loginEmailField");
const loginPassword = document.getElementById("loginPasswordField");
const loginSubmitBtn = document.getElementById("loginSubmitBtn");

const registerEmail = document.getElementById("registerEmailFiled");
const registerPassword = document.getElementById("registerPasswordFiled");
const registerFirstName = document.getElementById("registerFirstNameFiled");
const registerLastName = document.getElementById("registerLastNameFiled");
const registerPhone = document.getElementById("registerPhoneFiled");
const registerAddress = document.getElementById("registerAddressField");
const registerSubmitBtn = document.getElementById("registerSubmitBtn");

// Validation Functions
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
function validatePassword(password) {
  return password.length >= 6;
}
function showError(input, message) {
  removeError(input);
  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message";
  errorDiv.style.color = "#ff4444";
  errorDiv.style.fontSize = "12px";
  errorDiv.style.marginTop = "5px";
  errorDiv.style.marginLeft = "15px";
  errorDiv.textContent = message;
  input.parentElement.appendChild(errorDiv);
  input.style.border = "2px solid #ff4444";
}
function removeError(input) {
  const errorDiv = input.parentElement.querySelector(".error-message");
  if (errorDiv) {
    errorDiv.remove();
  }
  input.style.border = "none";
}

// REGISTER
registerSubmitBtn.addEventListener("click", (e) => {
  e.preventDefault();

  const email = registerEmail.value.trim();
  const password = registerPassword.value;
  removeError(registerEmail);
  removeError(registerPassword);

  // Validation
  if (!email) {
    showError(registerEmail, "Email is required");
    return;
  }

  if (!validateEmail(email)) {
    showError(registerEmail, "Invalid email format");
    return;
  }

  if (!password) {
    showError(registerPassword, "Password is required");
    return;
  }

  if (!validatePassword(password)) {
    showError(registerPassword, "Password must be at least 6 characters");
    return;
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      const uid = userCredential.user.uid;
      const fullName = `${registerFirstName.value} ${registerLastName.value}`;

      // Add user to Firestore
      const docRef = await addDoc(collection(db, "users"), {
        email: email,
        name: fullName,
        phone: registerPhone.value,
        address: registerAddress.value,
        role: "user",
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
        authUid: uid,
      });

      // Store user info in localStorage
      localStorage.setItem("userUID", uid);
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userRole", "user");
      localStorage.setItem("userName", fullName);
      localStorage.setItem("userDocId", docRef.id);
      localStorage.setItem("userPhone", registerPhone.value);
      localStorage.setItem("userAddress", registerAddress.value);

      window.location.href = "../public/index.html";
    })
    .catch((error) => {
      showError(registerEmail, error.message);
    });
});

// LOGIN
loginSubmitBtn.addEventListener("click", (e) => {
  e.preventDefault();
  const email = loginEmail.value;
  const password = loginPassword.value;
  removeError(loginEmail);
  removeError(loginPassword);
  if (!email) {
    showError(loginEmail, "Email is required");
    return;
  }
  if (!validateEmail(email)) {
    showError(loginEmail, "Invalid email format");
    return;
  }
  if (!password) {
    showError(loginPassword, "Password is required");
    return;
  }
  if (!validatePassword(password)) {
    showError(loginPassword, "Password must be at least 6 characters");
    return;
  }

  signInWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      const email = userCredential.user.email;
      const uid = userCredential.user.uid;

      // Get user data from Firestore
      const userRef = collection(db, "users");
      const q = query(userRef, where("email", "==", email));
      const snapshot = await getDocs(q);

      let role = "user";
      let userName = "";
      let userDocId = "";

      if (!snapshot.empty) {
        const userData = snapshot.docs[0].data();
        role = userData.role;
        userName = userData.name;
        userDocId = snapshot.docs[0].id;
      }

      // Store user info in localStorage
      localStorage.setItem("userUID", uid);
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userRole", role);
      localStorage.setItem("userName", userName);
      localStorage.setItem("userDocId", userDocId);
    })
    .catch((error) => {
      showError(loginEmail, error.message);
    });
});

// Auth Change State
onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  try {
    const email = user.email;
    const q = query(collection(db, "users"), where("email", "==", email));
    const snapshot = await getDocs(q);
    let role = "user";
    if (!snapshot.empty) {
      role = snapshot.docs[0].data().role;
    }
    if (role === "admin") {
      window.location.href = "../admin/dashboard.html";
    } else {
      window.location.href = "../public/index.html";
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
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
