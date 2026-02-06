// js/checkout.js
import {
  db,
  collection,
  getDocs,
  addDoc,
  query,
  where,
  deleteDoc,
  doc,
} from "./config/firebase.js";
import {
  getUserUID,
  getUserEmail,
  getUserName,
  getUserPhone,
  getUserAddress,
  isUserLoggedIn,
} from "./utils/userStorage.js";
import { getCart, clearCart } from "./utils/cart.js";

// Global variables
let currentCart = [];
let currentShippingType = "standard";

// Initialize page
async function initPage() {
  try {
    // Check if user is logged in
    if (isUserLoggedIn()) {
      await loadCart(getUserUID());
      setupEventListeners();
    } else {
      // Redirect to login if not authenticated
      showError("Please login to continue");
      setTimeout(() => {
        window.location.href = "login.html";
      }, 2000);
    }
  } catch (error) {
    console.error("Error initializing page:", error);
    showError("Failed to load. Please refresh the page.");
  }
}

// Load cart items from Firebase
async function loadCart() {
  try {
    const cartItems = getCart();

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      showError("Your cart is empty");
      return;
    }

    currentCart = cartItems;
    displayCart(cartItems);
  } catch (error) {
    console.error("Error loading cart:", error);
    showError("Failed to load cart.");
  }
}

// Display cart items
function displayCart(cartItems) {
  const orderItemsContainer = document.getElementById("orderItems");
  const itemCountElement = document.getElementById("itemCount");

  if (!cartItems || cartItems.length === 0) {
    orderItemsContainer.innerHTML = `
            <div class="empty-state">
                <p>Your cart is empty</p>
            </div>
        `;
    itemCountElement.textContent = "0";
    updateTotals();
    return;
  }

  let itemsHTML = "";
  cartItems.forEach((item) => {
    const price = parseFloat(item.price) || 0;
    const quantity = parseInt(item.quantity) || 1;
    const itemTotal = price * quantity;

    let rawData = item.imageUrl || item.image;
    let imgSrc = "";
    if (rawData) {
      if (rawData.startsWith("http") || rawData.startsWith("data:image")) {
        imgSrc = rawData;
      } else {
        imgSrc = "data:image/png;base64," + rawData;
      }
    }

    // --- التعديل هنا: مطابقة الـ HTML مع الـ CSS ---
    itemsHTML += `
            <div class="item-card">
                <div class="item-details">
                    <p class="product-name">${escapeHtml(item.productName || item.name || "Product")}</p>
                    <p class="brand-name">Brand: Aladdin</p>
                    <p class="price">$${itemTotal.toFixed(2)}</p>
                    ${quantity > 1 ? `<p class="item-quantity">Qty: ${quantity}</p>` : ""}
                </div>
                ${
                  imgSrc
                    ? `<img src="${imgSrc}" alt="Product" class="item-image">`
                    : `<div class="placeholder-image item-image">📦</div>`
                }
            </div>
        `;
    // ---------------------------------------------
  });

  orderItemsContainer.innerHTML = itemsHTML;
  
  // تحديث عدد العناصر في الأعلى
  const itemCountContainer = document.querySelector(".items-count");
  if (itemCountContainer) {
    itemCountContainer.innerHTML = `<span id="itemCount">${cartItems.length}</span> Item${cartItems.length !== 1 ? "s" : ""}`;
  }

  updateTotals();
}

// Update totals
function updateTotals() {
  if (!currentCart || currentCart.length === 0) {
    document.getElementById("subtotal").textContent = "$0.00";
    document.getElementById("shippingCost").textContent = "Free";
    document.getElementById("orderTotal").textContent = "$0.00";
    return;
  }

  const subtotal = currentCart.reduce((sum, item) => {
    const price = parseFloat(item.price) || 0;
    const quantity = parseInt(item.quantity) || 1;
    return sum + price * quantity;
  }, 0);

  const shippingCost = currentShippingType === "express" ? 12.87 : 0;
  const total = subtotal + shippingCost;

  document.getElementById("subtotal").textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById("shippingCost").textContent =
    shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}`;
  document.getElementById("orderTotal").textContent = `$${total.toFixed(2)}`;
}

// Setup event listeners
function setupEventListeners() {
  const shippingOptions = document.querySelectorAll('input[name="shipping"]');
  shippingOptions.forEach((input) => {
    input.addEventListener("change", (e) => {
      document.querySelectorAll(".shipping-option").forEach((opt) => {
        opt.classList.remove("user-selected");
      });
      e.target.closest(".shipping-option").classList.add("user-selected");

      currentShippingType = e.target.value;
      updateTotals();
    });
  });

  const submitBtn = document.getElementById("submitBtn");
  if (submitBtn) {
    submitBtn.addEventListener("click", handleSubmit);
  }
}

// Handle submit order
async function handleSubmit() {
  debugger;
  if (!isUserLoggedIn()) {
    alert("Please login to submit order");
    return;
  }

  if (!currentCart || currentCart.length === 0) {
    alert("Your cart is empty");
    return;
  }

  const submitBtn = document.getElementById("submitBtn");
  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting...";

  try {
    // Calculate totals
    const subtotal = currentCart.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 1;
      return sum + price * quantity;
    }, 0);

    const shippingCost = currentShippingType === "express" ? 12.87 : 0;
    const total = subtotal + shippingCost;

    // Create order object
    const orderData = {
      userId: getUserUID() ?? "",
      userEmail: getUserEmail() ?? "",
      userName: getUserName() ?? "",
      userPhone: getUserPhone() ?? "",
      userAddress: getUserAddress() ?? "",

      items: currentCart.map((item) => ({
        productId: item.id ?? "",
        productName: item.name ?? "",
        price: parseFloat(item.price) || 0,
        image: item.image ?? "",
        quantity: item.quantity ?? 1,
      })),
      subtotal: subtotal,
      shippingType: currentShippingType,
      shippingCost: shippingCost,
      total: total,
      status: "Pending",
      createdAt: new Date().toISOString(),
      orderDate: new Date().toISOString(),
    };

    // Add order to Firebase
    const ordersCollection = collection(db, "orders");
    try {
      await addDoc(ordersCollection, orderData).then(async () => {
        // alert("Order submitted successfully");
        window.location.href = "completed.html";
        await clearCart();
      });
    } catch (error) {
      console.error("Error submitting order:", error);
      // alert(error.message);
    }
    // Clear cart after successful order

    // Show success message
    showSuccess();

    // Redirect to orders page after 2 seconds
    setTimeout(() => {
      window.location.href = "order.html";
    }, 2000);
  } catch (error) {
    console.error("Error submitting order:", error);
    // alert("Failed to submit order. Please try again.");
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit";
  }
}

// Show success message
function showSuccess() {
  document.getElementById("overlay").classList.add("show");
  document.getElementById("successMessage").classList.add("show");
}

// Show error
function showError(message) {
  const orderItemsContainer = document.getElementById("orderItems");
  orderItemsContainer.innerHTML = `
        <div class="error-message">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <p>${escapeHtml(message)}</p>
            <button onclick="location.href='cart.html'" class="retry-btn">Go to Cart</button>
        </div>
    `;
}

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// To hide shipping options, uncomment the line below:
// document.getElementById('shippingOptions').classList.add('hidden');

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", initPage);

// Add this JavaScript code to your page
document.getElementById("submitBtn").addEventListener("click", function (e) {
  e.preventDefault(); // لو الزرار جوا form

  // هنا ممكن تحطي الكود بتاع حفظ البيانات في Firebase أو أي حاجة
  // بعد كده نروح على صفحة completed
});
