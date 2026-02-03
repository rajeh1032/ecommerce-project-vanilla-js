import {
  showLoading,
  hideLoading,
  showButtonLoading,
  hideButtonLoading,
} from "./utils.js";
import { closeEditModal, modals, currentEditId } from "./modalManager.js";
import {
  loadUsersData,
  loadCategoriesData,
  loadProductsData,
  loadOrdersData,
} from "./dataLoader.js";
import {
  updateUser,
  addCategory,
  updateCategory,
  addProduct,
  updateProduct,
  updateOrderStatus,
} from "./firebaseService.js";

// ================== FORM SUBMISSIONS ==================
export function setupFormHandlers() {
  setupUserForm();
  setupCategoryForm();
  setupProductForm();
  setupOrderForm();
}

// ===== USER FORM =====
function setupUserForm() {
  const userForm = modals.editUser.querySelector("form");

  userForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const submitBtn = this.querySelector('button[type="submit"]');
    showButtonLoading(submitBtn);

    const userData = {
      name: this.querySelector('[name="name"]').value,
      phone: this.querySelector('[name="phone"]').value,
      address: this.querySelector('[name="address"]').value,
      role: this.querySelector('[name="role"]').value,
      status: this.querySelector('[name="status"]').value,
    };

    try {
      await updateUser(currentEditId, userData);
      closeEditModal(modals.editUser);
      showLoading();
      await loadUsersData();
      hideLoading();
      alert("User updated successfully!");
    } catch (error) {
      alert("Error updating user: " + error.message);
    } finally {
      hideButtonLoading(submitBtn);
    }
  });
}

// ===== CATEGORY FORM =====
function setupCategoryForm() {
  const categoryForm = document.getElementById("categoryForm");

  categoryForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const submitBtn = this.querySelector('button[type="submit"]');
    showButtonLoading(submitBtn);

    const categoryData = {
      name: document.getElementById("categoryName").value,
      description: document.getElementById("categoryDesc").value,
    };

    const imageFile = document.getElementById("categoryImage").files[0];

    try {
      if (currentEditId) {
        await updateCategory(currentEditId, categoryData, imageFile);
        alert("Category updated successfully!");
      } else {
        await addCategory(categoryData, imageFile);
        alert("Category added successfully!");
      }

      closeEditModal(modals.category);
      showLoading();
      await loadCategoriesData();
      hideLoading();
    } catch (error) {
      alert("Error saving category: " + error.message);
    } finally {
      hideButtonLoading(submitBtn);
    }
  });
}

// ===== PRODUCT FORM =====
function setupProductForm() {
  const productForm = document.getElementById("productForm");

  productForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const submitBtn = this.querySelector('button[type="submit"]');
    showButtonLoading(submitBtn);

    const productData = {
      name: document.getElementById("productName").value,
      categoryID: document.getElementById("productcategory").value,
      price: document.getElementById("productPrice").value,
      quantity: document.getElementById("productQuantity").value,
      status: document.getElementById("productStatus").value,
    };

    const imageFile = document.getElementById("productImage").files[0];

    try {
      if (currentEditId) {
        await updateProduct(currentEditId, productData, imageFile);
        alert("Product updated successfully!");
      } else {
        await addProduct(productData, imageFile);
        alert("Product added successfully!");
      }

      closeEditModal(modals.product);
      showLoading();
      await loadProductsData();
      hideLoading();
    } catch (error) {
      alert("Error saving product: " + error.message);
    } finally {
      hideButtonLoading(submitBtn);
    }
  });
}

// ===== ORDER FORM =====
function setupOrderForm() {
  const orderForm = document.getElementById("orderForm");

  orderForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const submitBtn = this.querySelector('button[type="submit"]');
    showButtonLoading(submitBtn);

    const status = document.getElementById("orderStatus").value;

    try {
      await updateOrderStatus(currentEditId, status);
      closeEditModal(modals.order);
      showLoading();
      await loadOrdersData();
      hideLoading();
      alert("Order status updated successfully!");
    } catch (error) {
      alert("Error updating order: " + error.message);
    } finally {
      hideButtonLoading(submitBtn);
    }
  });
}
