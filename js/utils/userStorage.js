export function getUserUID() {
  return localStorage.getItem("userUID");
}

export function getUserEmail() {
  return localStorage.getItem("userEmail");
}

export function getUserRole() {
  return localStorage.getItem("userRole");
}

export function getUserName() {
  return localStorage.getItem("userName");
}

export function getUserDocId() {
  return localStorage.getItem("userDocId");
}

export function getCurrentUser() {
  return {
    uid: getUserUID(),
    email: getUserEmail(),
    role: getUserRole(),
    name: getUserName(),
    docId: getUserDocId(),
  };
}

export function isUserLoggedIn() {
  return !!getUserUID();
}

export function clearUserData() {
  localStorage.removeItem("userUID");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userRole");
  localStorage.removeItem("userName");
  localStorage.removeItem("userDocId");
}

export function isAdmin() {
  return getUserRole() === "admin";
}
