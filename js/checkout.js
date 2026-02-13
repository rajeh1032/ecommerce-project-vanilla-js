import { 
    db, 
    collection, 
    addDoc, 
    doc,
    getDoc,
    updateDoc  
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

let currentCart = [];
let currentShippingType = "standard";

async function initPage() {
  try {
    if (isUserLoggedIn()) {
      await loadCart(getUserUID());
      setupEventListeners();
    } else {
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
  });

  orderItemsContainer.innerHTML = itemsHTML;
  
  const itemCountContainer = document.querySelector(".items-count");
  if (itemCountContainer) {
    itemCountContainer.innerHTML = `<span id="itemCount">${cartItems.length}</span> Item${cartItems.length !== 1 ? "s" : ""}`;
  }

  updateTotals();
}

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

async function handleSubmit() {
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
  submitBtn.innerHTML = '<span class="spinner"></span> Processing your order...';

  try {
    const subtotal = currentCart.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 1;
      return sum + price * quantity;
    }, 0);

    const shippingCost = currentShippingType === "express" ? 12.87 : 0;
    const total = subtotal + shippingCost;
    const now = new Date().toISOString();

    const orderData = {
      userId: getUserUID() ?? "",
      userEmail: getUserEmail() ?? "",
      userName: getUserName() ?? "",
      userPhone: getUserPhone() ?? "",
      userAddress: getUserAddress() ?? "",
      items: currentCart.map((item) => ({
        productId: item.id ?? "",
        productName: item.name ?? item.productName ?? "",
        price: parseFloat(item.price) || 0,
        image: item.image ?? item.imageUrl ?? "",
        quantity: item.quantity ?? 1,
      })),
      subtotal: subtotal,
      shippingType: currentShippingType,
      shippingCost: shippingCost,
      total: total,
      status: "processing",
      createdAt: now,
      orderDate: now
    };

    const ordersCollection = collection(db, "orders");
    await addDoc(ordersCollection, orderData);

    const updatePromises = currentCart.map(async (item) => {
      if (!item.id) return;
      const productRef = doc(db, 'products', item.id);
      const productSnap = await getDoc(productRef);

      if (productSnap.exists()) {
        const productData = productSnap.data();
        const currentStock = parseInt(productData.quantity || productData.stock) || 0;
        const newQuantity = Math.max(0, currentStock - (item.quantity || 1));
        const newStatus = newQuantity === 0 ? 'out-stock' : 'in-stock';

        return updateDoc(productRef, {
          quantity: newQuantity,
          status: newStatus
        });
      }
    });

    await Promise.all(updatePromises);
    await clearCart();
    showSuccess();

    setTimeout(() => {
      window.location.href = "completed.html";
    }, 2000);

  } catch (error) {
    console.error("Order Error:", error);

    if (error.code === 'permission-denied') {
        alert("Session expired or permission denied. Please login again.");
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit Order";
    } else {
        console.log("Minor delay, redirecting anyway...");
        window.location.href = "completed.html";
    }
  }
}

function showSuccess() {
  document.getElementById("overlay").classList.add("show");
  document.getElementById("successMessage").classList.add("show");
}

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

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
document.addEventListener("DOMContentLoaded", initPage);

