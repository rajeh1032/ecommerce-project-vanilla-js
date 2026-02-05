import { showLoading, hideLoading } from "./utils.js";
import {
  openEditModal,
  closeEditModal,
  setEditState,
  modals,
  modalTitles,
} from "./modalManager.js";
import {
  loadUsersData,
  loadCategoriesData,
  loadProductsData,
  loadOrdersData,
} from "./dataLoader.js";
import {
  deleteUser,
  deleteProduct,
  deleteCategory,
} from "./firebaseService.js";
//EVENT DELEGATION

export function setupEventListeners() {
  document.addEventListener("click", handleGlobalClick);
}
async function handleGlobalClick(e) {
  // USER HANDLERS
  if (e.target.classList.contains("edit-user")) {
    handleEditUser(e.target);
  }

  if (e.target.classList.contains("delete-user")) {
    await handleDeleteUser(e.target);
  }

  if (
    e.target.classList.contains("close-user-modal") ||
    e.target === modals.editUser
  ) {
    closeEditModal(modals.editUser);
  }

  //  CATEGORY HANDLERS 
  if (e.target.classList.contains("edit-category")) {
    handleEditCategory(e.target);
  }

  if (e.target.id === "addCategoryBtn") {
    handleAddCategory();
  }

  if (e.target.classList.contains("delete-category")) {
    await handleDeleteCategory(e.target);
  }

  if (
    e.target.classList.contains("close-category-modal") ||
    e.target === modals.category
  ) {
    closeEditModal(modals.category);
  }

  //  PRODUCT HANDLERS 
  if (e.target.classList.contains("edit-product")) {
    handleEditProduct(e.target);
  }

  if (e.target.id === "addProductBtn") {
    handleAddProduct();
  }

  if (e.target.classList.contains("delete-product")) {
    await handleDeleteProduct(e.target);
  }

  if (
    e.target.classList.contains("close-product-modal") ||
    e.target === modals.product
  ) {
    closeEditModal(modals.product);
  }

  //  ORDER HANDLERS 
  if (e.target.classList.contains("edit-order")) {
    handleEditOrder(e.target);
  }

  if (
    e.target.classList.contains("close-order-modal") ||
    e.target === modals.order
  ) {
    closeEditModal(modals.order);
  }
}
//USER EVENT HANDLERS

function handleEditUser(target) {
  openEditModal(modals.editUser);
  setEditState(target.dataset.userId, "user");
  const form = modals.editUser.querySelector("form");
  form.querySelector('input[type="text"]').value = target.dataset.name;
  form.querySelector('input[type="email"]').value = target.dataset.email;
  form.querySelector('input[type="tel"]').value = target.dataset.phone;
  form.querySelectorAll('input[type="text"]')[1].value = target.dataset.address;
  form.querySelectorAll("select")[0].value = target.dataset.role;
  form.querySelectorAll("select")[1].value = target.dataset.status;
}
async function handleDeleteUser(target) {
  if (confirm("Are you sure you want to delete this user?")) {
    showLoading();
    try {
      await deleteUser(target.dataset.userId);
      await loadUsersData();
    } catch (err) {
      alert("Error deleting user: " + err.message);
    } finally {
      hideLoading();
    }
  }
}
//CATEGORY EVENT HANDLERS
function handleEditCategory(target) {
  openEditModal(modals.category);

  modalTitles.category.textContent = "Edit Category";
  document.getElementById("categoryName").value = target.dataset.name;
  document.getElementById("categoryDesc").value = target.dataset.description;
}

function handleAddCategory() {
  openEditModal(modals.category);
  setEditState(null, "category");

  modalTitles.category.textContent = "Add Category";
  document.getElementById("categoryForm").reset();
}

async function handleDeleteCategory(target) {
  if (confirm("Are you sure you want to delete this category?")) {
    showLoading();
    try {
      await deleteCategory(target.dataset.categoryId);
      await loadCategoriesData();
    } catch (err) {
      alert("Error deleting category: " + err.message);
    } finally {
      hideLoading();
    }
  }
}
//PRODUCT EVENT HANDLERS
function handleEditProduct(target) {
  openEditModal(modals.product);
  setEditState(target.dataset.productId, "product");

  modalTitles.product.textContent = "Edit Product";
  document.getElementById("productName").value = target.dataset.name;
  document.getElementById("productcategory").value = target.dataset.category;
  document.getElementById("productPrice").value = target.dataset.price;
  document.getElementById("productQuantity").value = target.dataset.quantity;
  document.getElementById("productStatus").value = target.dataset.status;
}

function handleAddProduct() {
  openEditModal(modals.product);
  setEditState(null, "product");

  modalTitles.product.textContent = "Add Product";
  document.getElementById("productForm").reset();
}

async function handleDeleteProduct(target) {
  if (confirm("Are you sure you want to delete this product?")) {
    showLoading();
    try {
      await deleteProduct(target.dataset.productId);
      await loadProductsData();
    } catch (err) {
      alert("Error deleting product: " + err.message);
    } finally {
      hideLoading();
    }
  }
}
// ORDER EVENT HANDLERS
function handleEditOrder(target) {
  openEditModal(modals.order);
  setEditState(target.dataset.orderId, "order");

  modalTitles.order.textContent = "Edit Order Status";
  document.getElementById("orderStatus").value = target.dataset.status;
}
