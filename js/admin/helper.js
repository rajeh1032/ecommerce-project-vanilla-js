// ================== HELPER FUNCTIONS ==================

// Convert file to base64
export function convertToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}
// prepare image for firebase
export async function prepareImage(imageFile) {
  if (!imageFile) return "";
  return await convertToBase64(imageFile);
}
// get timestamp
export function getTimestamp() {
  return new Date().toISOString();
}
