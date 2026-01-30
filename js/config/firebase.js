// js/firebase/firebaseService.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCnM5ndqZOyosxKtyrmfMAhIRMuymDDAqM",
  authDomain: "khordaclick.firebaseapp.com",
  projectId: "khordaclick",
  storageBucket: "khordaclick.firebasestorage.app",
  messagingSenderId: "941077442352",
  appId: "1:941077442352:web:461389879b9ef02a02a2f5",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
