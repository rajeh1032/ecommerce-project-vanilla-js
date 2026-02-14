// js/orders.js
import { fetchOrdersByUserId } from "./services/order.service.js";
import { auth, onAuthStateChanged } from "./config/firebase.js";
import { getCurrentUserData } from "./services/user.service.js";

let allOrders = [];
let currentFilter = "all";
let currentAuthUser = null;
let currentUserProfile = null;

function waitForAuthUser() {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

async function initPage() {
  try {
    currentAuthUser = auth.currentUser || (await waitForAuthUser());
    if (!currentAuthUser) {
      showError("Please login to view your orders");
      setTimeout(() => {
        window.location.href = "login.html";
      }, 2000);
      return;
    }

    currentUserProfile = await getCurrentUserData();
    if (!currentUserProfile) {
      showError("User profile not found. Please login again.");
      return;
    }

    await loadOrders(currentAuthUser.uid);
    setupEventListeners();
  } catch (error) {
    console.error("Error initializing page:", error);
    showError("Failed to initialize page.");
  }
}

async function loadOrders(userId) {
  try {
    const orders = await fetchOrdersByUserId(userId);
    allOrders = orders;
    displayOrders(orders);
  } catch (error) {
    console.error("Error loading orders:", error);
    showError("Failed to load orders.");
  }
}

function displayOrders(orders) {
  const container = document.getElementById("ordersContainer");

  if (!orders || orders.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">[ ]</div>
        <h3>No Orders Yet</h3>
        <p>You haven't placed any orders. Start shopping!</p>
        <button class="empty-btn" onclick="location.href='index.html'">Start Shopping</button>
      </div>`;
    return;
  }

  container.innerHTML = orders.map((order) => buildOrderCard(order)).join("");
}

function buildOrderCard(order) {
  const date = formatDate(order.createdAt || order.orderDate);
  const statusRaw = (order.status || "pending").toLowerCase();
  const statusShow = capitalize(statusRaw);

  return `
    <div class="order-card">
      <div class="order-header">
        <div class="order-info">
          <div class="order-date">${date}</div>
        </div>
        <div class="order-status status-${statusRaw}">
          ${statusShow}
        </div>
      </div>

      <div class="order-products">
        ${(order.items || [])
          .map(
            (item) => `
          <div class="order-product">
            <div class="product-image">
              <img src="${escapeHtml(item.image || "")}" />
            </div>
            <div class="item-details">
              <div class="item-name">${escapeHtml(item.productName || "Product")}</div>
              <div class="item-meta">
                Qty: ${item.quantity || 1} x $${parseFloat(item.price || 0).toFixed(2)}
              </div>
            </div>
            <div class="product-price">
              $${(parseFloat(item.price || 0) * (item.quantity || 1)).toFixed(2)}
            </div>
          </div>
        `,
          )
          .join("")}
      </div>

      <div class="order-footer">
        <div class="order-total">
          <span>Total</span>
          <span class="total-amount">$${parseFloat(order.total || 0).toFixed(2)}</span>
        </div>
      </div>
    </div>
  `;
}

function filterOrders(status) {
  currentFilter = status;
  if (status === "all") {
    displayOrders(allOrders);
  } else {
    displayOrders(
      allOrders.filter((o) => (o.status || "").toLowerCase() === status),
    );
  }
}

function setupEventListeners() {
  document.querySelectorAll(".filter-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document
        .querySelectorAll(".filter-tab")
        .forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      filterOrders(tab.dataset.status);
    });
  });

  const modalClose = document.getElementById("modalClose");
  const modalOverlay = document.getElementById("modalOverlay");

  if (modalClose) modalClose.addEventListener("click", closeModal);
  if (modalOverlay) modalOverlay.addEventListener("click", closeModal);
}

window.openModal = function (orderId) {
  const order = allOrders.find((o) => o.id === orderId);
  if (!order) return;

  const statusRaw = (order.status || "pending").toLowerCase();
  const items = order.items || [];
  const subtotal = items.reduce(
    (sum, i) => sum + parseFloat(i.price || 0) * (i.quantity || 1),
    0,
  );

  document.getElementById("modalBody").innerHTML = `
    <div class="modal-section">
      <div class="modal-section-title">Order Information</div>
      <div class="modal-row"><span class="modal-label">Date</span><span class="modal-value">${formatDate(order.createdAt || order.orderDate)}</span></div>
      <div class="modal-row"><span class="modal-label">Status</span><span class="order-status status-${statusRaw}">${capitalize(statusRaw)}</span></div>
      <div class="modal-row"><span class="modal-label">Customer</span><span class="modal-value">${escapeHtml(order.userName || currentUserProfile?.name || "")}</span></div>
    </div>

    <div class="modal-section">
      <div class="modal-section-title">Items</div>
      ${items
        .map(
          (item) => `
        <div class="order-product">
          <div class="item-details">
            <div class="item-name">${escapeHtml(item.productName || "Product")}</div>
            <div class="item-meta">Qty: ${item.quantity || 1} x $${parseFloat(item.price || 0).toFixed(2)}</div>
          </div>
          <div class="product-price">$${(parseFloat(item.price || 0) * (item.quantity || 1)).toFixed(2)}</div>
        </div>
      `,
        )
        .join("")}
    </div>

    <div class="modal-section">
      <div class="modal-section-title">Summary</div>
      <div class="modal-row"><span class="modal-label">Subtotal</span><span class="modal-value">$${subtotal.toFixed(2)}</span></div>
      <div class="modal-row"><span class="modal-label">Shipping</span><span class="modal-value">${order.shippingCost ? `$${parseFloat(order.shippingCost).toFixed(2)}` : "Free"}</span></div>
      <div class="modal-total">
        <span>Total</span>
        <span class="modal-total-amount">$${parseFloat(order.total || subtotal).toFixed(2)}</span>
      </div>
    </div>`;

  document.getElementById("modalOverlay").classList.add("show");
  document.getElementById("orderModal").classList.add("show");
};

function closeModal() {
  document.getElementById("modalOverlay").classList.remove("show");
  document.getElementById("orderModal").classList.remove("show");
}

function formatDate(str) {
  if (!str) return "N/A";
  return new Date(str).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function escapeHtml(text) {
  if (!text) return "";
  const d = document.createElement("div");
  d.textContent = text;
  return d.innerHTML;
}

function showError(msg) {
  document.getElementById("ordersContainer").innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">!</div>
      <h3>Error</h3>
      <p>${escapeHtml(msg)}</p>
      <button class="empty-btn" onclick="location.reload()">Retry</button>
    </div>`;
}

document.addEventListener("DOMContentLoaded", initPage);
