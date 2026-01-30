import { db } from "../config/firebase.js";
import { doc, getDoc, setDoc } from
"https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
  

export async function getUserData(uid) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

export async function saveUserData(uid, data) {
  const ref = doc(db, "users", uid);
  await setDoc(ref, data, { merge: true });
}
