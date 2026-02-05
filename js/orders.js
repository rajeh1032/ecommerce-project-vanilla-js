// js/orders.js
import { fetchOrdersByUserId } from "./services/order.service.js";
import { getUserUID, isUserLoggedIn } from "./utils/userStorage.js";

let allOrders = [];
let currentFilter = "all";
let userId = getUserUID();

// ─── Init ──────────────────────────────────────
async function initPage() {
  if (!isUserLoggedIn()) {
    showError("Please login to view your orders");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 2000);
    return;
  }
  await loadOrders();
  console.log("user id is ", userId);
  console.log("all order is ", allOrders);
  setupEventListeners();
}

// ─── جلب الأوردرات بـ userId ──────────────────
async function loadOrders() {
  try {
    const orders = await fetchOrdersByUserId(userId);
    allOrders = orders;
    displayOrders(orders);
  } catch (error) {
    console.error("Error loading orders:", error);
    showError("Failed to load orders.");
  }
}

// ─── عرض الأوردرات ────────────────────────────
function displayOrders(orders) {
  const container = document.getElementById("ordersContainer");

  if (!orders || orders.length === 0) {
    container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📦</div>
                <h3>No Orders Yet</h3>
                <p>You haven't placed any orders. Start shopping!</p>
                <button class="empty-btn" onclick="location.href='../index.html'">Start Shopping</button>
            </div>`;
    return;
  }

  container.innerHTML = orders.map((order) => buildOrderCard(order)).join("");
}

// ─── كارد كل أورد ─────────────────────────────
function buildOrderCard(order) {
  const date = formatDate(order.createdAt || order.orderDate);
  const statusRaw = (order.status || "pending").toLowerCase();
  const statusShow = capitalize(statusRaw);

  return `
      <div class="order-card">
        <div class="order-header">
          <div class="order-info">
            <div class="order-id">
              Order #${order.id.substring(0, 8).toUpperCase()}
            </div>
            <div class="order-date">${date}</div>
          </div>
          <div class="order-status status-${statusRaw}">
            ${statusShow}
          </div>
        </div>

        <div class="order-products">
          ${order.items
            .map(
              (item) => `
            <div class="order-product">
              <div class="product-image">
                <img src="${item.image}" />
              </div>
              <div class="item-details">
                <div class="item-name">${escapeHtml(item.productName)}</div>
                <div class="item-meta">
                  Qty: ${item.quantity} × $${item.price}
                </div>
              </div>
              <div class="product-price">
                $${(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          `,
            )
            .join("")}
        </div>

        <div class="order-footer">
          <div class="order-total">
            <span>Total</span>
            <span class="total-amount">$${order.total.toFixed(2)}</span>
          </div>
          <button class="btn-details"
            onclick="openModal('${order.id}')">
            View Details
          </button>
        </div>
      </div>
    `;
}

// ─── فلترة حسب الـ status ─────────────────────
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

// ─── Event Listeners ───────────────────────────
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

  document.getElementById("modalClose").addEventListener("click", closeModal);
  document.getElementById("modalOverlay").addEventListener("click", closeModal);
}

// ─── Modal ─────────────────────────────────────
window.openModal = function (orderId) {
  const order = allOrders.find((o) => o.id === orderId);
  if (!order) return;

  const statusRaw = (order.status || "pending").toLowerCase();
  const total =
    (parseFloat(order.price) || 0) * (parseInt(order.quantity) || 1);

  document.getElementById("modalBody").innerHTML = `
        <div class="modal-section">
            <div class="modal-section-title">Order Information</div>
            <div class="modal-row"><span class="modal-label">Order ID</span><span class="modal-value">#${order.id.substring(0, 8).toUpperCase()}</span></div>
            <div class="modal-row"><span class="modal-label">Date</span><span class="modal-value">${formatDate(order.createdAt)}</span></div>
            <div class="modal-row"><span class="modal-label">Status</span><span class="order-status status-${statusRaw}">${capitalize(statusRaw)}</span></div>
            <div class="modal-row"><span class="modal-label">Customer</span><span class="modal-value">${escapeHtml(order.userName)}</span></div>
            <div class="modal-row"><span class="modal-label">Phone</span><span class="modal-value">${escapeHtml(order.userPhone)}</span></div>
        </div>

        <div class="modal-section">
            <div class="modal-section-title">Item</div>
            <div class="order-product">
                <div class="product-image"><div class="placeholder-image">📦</div></div>
                <div class="item-details">
                    <div class="item-name">${escapeHtml(order.details)}</div>
                    <div class="item-meta">Qty: ${order.quantity} × $${(parseFloat(order.price) || 0).toFixed(2)}</div>
                </div>
                <div class="product-price">$${total.toFixed(2)}</div>
            </div>
        </div>

        <div class="modal-section">
            <div class="modal-section-title">Summary</div>
            <div class="modal-row"><span class="modal-label">Subtotal</span><span class="modal-value">$${total.toFixed(2)}</span></div>
            <div class="modal-row"><span class="modal-label">Shipping</span><span class="modal-value">Free</span></div>
            <div class="modal-total">
                <span>Total</span>
                <span class="modal-total-amount">$${total.toFixed(2)}</span>
            </div>
        </div>`;

  document.getElementById("modalOverlay").classList.add("show");
  document.getElementById("orderModal").classList.add("show");
};

function closeModal() {
  document.getElementById("modalOverlay").classList.remove("show");
  document.getElementById("orderModal").classList.remove("show");
}

// ─── Helpers ───────────────────────────────────
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
            <div class="empty-icon">⚠️</div>
            <h3>Error</h3>
            <p>${escapeHtml(msg)}</p>
            <button class="empty-btn" onclick="location.reload()">Retry</button>
        </div>`;
}

document.addEventListener("DOMContentLoaded", initPage);
