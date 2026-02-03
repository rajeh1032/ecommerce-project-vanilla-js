import {
  getCategories,
  getProducts,
  getUsers,
  getOrders,
} from "./firebaseService.js";
import { formatImageSrc } from "./utils.js";
// dashboard state
export async function loadDashBoardState() {
  try {
    const [users, categories, products, orders] = await Promise.all([
      getUsers(),
      getCategories(),
      getProducts(),
      getOrders(),
    ]);
    //boxes of info in first page
    const dataBoxes = document.querySelectorAll(".data-info .box .data span");
    if (dataBoxes.length >= 4) {
      dataBoxes[0].textContent = users.length;
      dataBoxes[1].textContent = categories.length;
      dataBoxes[2].textContent = products.length;
      dataBoxes[3].textContent = orders.length;
    }
    //table of products in first page
    const tbody = document.querySelector("table tbody");
    if (tbody) {
      tbody.innerHTML = products
        .slice(0, 4)
        .map(
          (products) => `
   <tr>
   <td>${products.name}</td>
   <td><span class="price">${products.price}</span></td>
   <td><span class="count">${products.quantity}</span></td>
   </tr>
    `,
        )
        .join("");
    }
  } catch (error) {
    console.error("Error loading dashboard stats:", error);
  }
}
//Users
export async function loadUsersData() {
  try {
    const users = await getUsers();
    const tbody = document.querySelector("table tbody");
    if (!tbody) return;

    tbody.innerHTML = users
      .map(
        (user) => `
      <tr data-user-id="${user.id}">
        <td>${user.name || ""}</td>
        <td><span>${user.email || ""}</span></td>
        <td><span>${user.phone || ""}</span></td>
        <td><span>${user.address || ""}</span></td>
        <td><span class="count">${user.role || "user"}</span></td>
        <td>
          <i class="fa-solid fa-pen price edit-user" 
             data-user-id="${user.id}"
             data-name="${user.name || ""}"
             data-email="${user.email || ""}"
             data-phone="${user.phone || ""}"
             data-address="${user.address || ""}"
             data-role="${user.role || "user"}"
             data-status="${user.status || "active"}">
          </i>
        </td>
        <td><i class="fa fa-trash delete delete-user" data-user-id="${user.id}"></i></td>
      </tr>
    `,
      )
      .join("");
  } catch (error) {
    console.error("Error loading users data:", error);
  }
}

//CATEGORIES
export async function loadCategoriesData() {
  try {
    const categories = await getCategories();
    const tbody = document.querySelector("table tbody");
    if (!tbody) return;

    tbody.innerHTML = categories
      .map(
        (category) => `
   <tr data-category-id=${category.id}>
   <td>${category.name || ""}</td>
   <td><span class="price">${category.description || ""}</span></td>
   <td><img src="${formatImageSrc(category.imageUrl || "")}" alt="Category-image" class="categoryImg"></td>
   <td>
   <i class="fa-solid fa-pen price edit-category"  data-category-id="${category.id}"
   data-name="${category.name}"
   data-description="${category.description}"
   data-image-url="${formatImageSrc(category.imageUrl || "")}"
   >  </i>
        </td>
        <td><i class="fa fa-trash delete delete-category" data-category-id="${category.id}"></i></td>
      </tr>
    `,
      )
      .join("");
  } catch (error) {
    console.error("Error loading categories data:", error);
  }
}
//PRODUCTS
export async function loadProductsData() {
  try {
    const [products, categories] = await Promise.all([
      getProducts(),
      getCategories(),
    ]);

    const categorySelect = document.getElementById("productcategory");
    if (categorySelect) {
      categorySelect.innerHTML = categories
        .map((cat) => `<option value="${cat.id}">${cat.name}</option>`)
        .join("");
    }

    const tbody = document.querySelector("table tbody");
    if (!tbody) return;

    tbody.innerHTML = products
      .map((product) => {
        const category = categories.find((c) => c.id === product.categoryID);

        return `  
        <tr data-product-id="${product.id}">
          <td>${product.name || ""}</td>
          <td><span>${category ? category.name : "N/A"}</span></td>
          <td>
            <img src="${formatImageSrc(product.imageUrl)}" 
                 alt="Product-image" 
                 class="categoryImg" />
          </td>
          <td><span class="price">$${product.price || 0}</span></td>
          <td><span class="count">${product.quantity || 0}</span></td>
          <td><span class="count">${product.status || "in stock"}</span></td>
          <td>
            <i class="fa-solid fa-pen price edit-product"
               data-product-id="${product.id}"
               data-name="${product.name || ""}"
               data-category="${product.categoryID || ""}"
               data-price="${product.price || 0}"
               data-quantity="${product.quantity || 0}"
               data-status="${product.status || "in stock"}">
            </i>
          </td>
          <td><i class="fa fa-trash delete delete-product" data-product-id="${product.id}"></i></td>
        </tr>
    `;
      })
      .join("");
  } catch (error) {
    console.error("Error loading products data:", error);
  }
}
// orders
export async function loadOrdersData() {
  try {
    const orders = await getOrders();
    const tbody = document.querySelector("table tbody");
    if (!tbody) return;

    tbody.innerHTML = orders
      .map(
        (order) => `
      <tr data-order-id="${order.id}">
        <td>${order.customerName || ""}</td>
        <td>${order.details || ""}</td>
        <td>${order.phoneNumber || ""}</td>
        <td><span class="count">${order.quantity || 0}</span></td>
        <td><span class="price">$${order.price || 0}</span></td>
        <td><span class="count">${order.status || "pending"}</span></td>
        <td>
          <i class="fa-solid fa-pen price edit-order" 
             data-order-id="${order.id}"
             data-status="${order.status || "pending"}">
          </i>
        </td>
      </tr>
    `,
      )
      .join("");
  } catch (error) {
    console.error("Error loading orders data:", error);
  }
}
