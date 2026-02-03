// ================== LOADING FUNCTIONS ==================

const loadingOverlay = document.getElementById("loadingOverlay");

export function showLoading() {
  if (loadingOverlay) {
    loadingOverlay.classList.add("active");
  }
}

export function hideLoading() {
  if (loadingOverlay) {
    loadingOverlay.classList.remove("active");
  }
}

export function showButtonLoading(button) {
  button.classList.add("loading");
  button.disabled = true;
}

export function hideButtonLoading(button) {
  button.classList.remove("loading");
  button.disabled = false;
}

// ================== Modal FUNCTIONS ==================
export function openModal(modal) {
  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
}
export function closeModal(modal) {
  modal.style.display = "none";
  document.body.style.overflow = "auto";
}
// ================== Images Utils ==================
export function formatImageSrc(
  imageUrl,
  fallback = "../assets/images/default-image.png",
) {
  if (!imageUrl) return fallback;
  if (imageUrl.startsWith("data:") || imageUrl.startsWith("http")) {
    return imageUrl;
  }
  return `data:image/jpeg;base64,${imageUrl}`;
}
