// js/auth/login.js
import {
  auth,
  db,
  getDoc,
  doc,
  setDoc,
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
function validateName(name) {
  const nameRegex = /^[A-Za-z\u0600-\u06FF ]{2,}$/;
  return nameRegex.test(name.trim());
}

function validatePhone(phone) {
  const phoneRegex = /^(010|011|012|015)[0-9]{8}$/;
  return phoneRegex.test(phone);
}

function validatePasswordStrong(password) {
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
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

  const firstName = registerFirstName.value.trim();
  const lastName = registerLastName.value.trim();
  const phone = registerPhone.value.trim();

  removeError(registerEmail);
  removeError(registerPassword);
  removeError(registerFirstName);
  removeError(registerLastName);
  removeError(registerPhone);

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

  if (!validatePasswordStrong(password)) {
    showError(
      registerPassword,
      "Password must be at least 8 characters with at least one letter and one number",
    );
    return;
  }
  if (!firstName) {
    showError(registerFirstName, "First name is required");
    return;
  }
  if (!validateName(firstName)) {
    showError(registerFirstName, "Invalid name");
    return;
  }

  // Last Name
  if (!lastName) {
    showError(registerLastName, "Last name is required");
    return;
  }
  if (!validateName(lastName)) {
    showError(registerLastName, "Invalid name");
    return;
  }

  // Phone
  if (!phone) {
    showError(registerPhone, "Phone number is required");
    return;
  }
  if (!validatePhone(phone)) {
    showError(registerPhone, "Invalid Egyptian phone number");
    return;
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      const uid = userCredential.user.uid;
      const fullName = `${registerFirstName.value} ${registerLastName.value}`;

      // Add user to Firestore
      await setDoc(doc(db, "users", uid), {
        email: email,
        name: fullName,
        phone: registerPhone.value,
        address: registerAddress.value,
        role: "user",
        status: "active",
        createdAt: new Date(),
      });

      // Store user info in localStorage
      localStorage.setItem("userUID", uid);
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userRole", "user");
      localStorage.setItem("userName", fullName);
      localStorage.setItem("userDocId", uid);
      localStorage.setItem("userPhone", registerPhone.value);
      localStorage.setItem("userAddress", registerAddress.value);

      window.location.href = "../index.html";
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
  // if (!validatePasswordStrong(password)) {
  //   showError(loginPassword, "Password must be at least 8 characters with at least one letter and one number");
  //   return;
  // }

  signInWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      const uid = userCredential.user.uid;

      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      let role = "user";
      let userName = "";
      let userPhone = "";
      let userAddress = "";

      if (docSnap.exists()) {
        const userData = docSnap.data();
        role = userData.role;
        userName = userData.name;
        userPhone = userData.phone || "";
        userAddress = userData.address || "";
      }
    })

    .catch((error) => {
      showError(loginEmail, error.message);
    });
});

// Auth Change State
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    if (!window.location.pathname.includes("login.html")) {
      window.location.href = "login.html";
    }
    return;
  }

  try {
    let role = "user";
    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      role = userDocSnap.data().role || "user";
    }

    if (role === "admin") {
      if (!window.location.pathname.includes("dashboard.html")) {
        window.location.href = "../admin/dashboard.html";
      }
    } else {
      if (!window.location.pathname.includes("index.html")) {
        window.location.href = "../index.html";
      }
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
  const data = await getCurrentUserData();
  console.log("Current user data:", data);
});
export async function getCurrentUserData() {
  const user = auth.currentUser;
  if (!user) return null;

  const docRef = doc(db, "users", user.uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data();
  }

  return null;
}

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
