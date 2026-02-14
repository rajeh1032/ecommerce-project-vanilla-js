import {
  auth,
  db,
  doc,
  getDoc,
  onAuthStateChanged,
  collection,
  query,
  where,
  getDocs,
} from "../config/firebase.js";

function waitForAuthUser() {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

export async function getCurrentUserData() {
  const user = auth.currentUser || (await waitForAuthUser());
  if (!user) return null;

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) return userSnap.data();

  // Fallback for old schema where Firestore doc id is random (created with addDoc)
  const byAuthUidQuery = query(
    collection(db, "users"),
    where("authUid", "==", user.uid),
  );
  const byAuthUidSnap = await getDocs(byAuthUidQuery);
  if (!byAuthUidSnap.empty) return byAuthUidSnap.docs[0].data();

  // Second fallback if authUid was never stored
  const byEmailQuery = query(
    collection(db, "users"),
    where("email", "==", user.email),
  );
  const byEmailSnap = await getDocs(byEmailQuery);
  if (!byEmailSnap.empty) return byEmailSnap.docs[0].data();

  return null;
}
