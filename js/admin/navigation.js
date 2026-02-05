import { hideLoading, showLoading } from "./utils.js";
import {
  loadDashBoardState,
  loadUsersData,
  loadCategoriesData,
  loadProductsData,
  loadOrdersData,
} from "./dataLoader.js";
//  SPA NAVIGATION 
const mainContent = document.getElementById("content");
const menuLinks = document.querySelectorAll(".menu ul li a");

function setActiveLink(clickedLink) {
  menuLinks.forEach((link) => link.classList.remove("active"));
  clickedLink.classList.add("active");
}

function loadPage(path) {
  showLoading();
  fetch(path)
    .then((res) => res.text())
    .then((htmlString) => {
      mainContent.innerHTML = htmlString;
      const currentPage = path.split("/").pop().split(".")[0];
      loadPageData(currentPage);
    })
    .catch(() => {
      mainContent.innerHTML = "<p>error</p>";
    });
}
// Load data based on current page

async function loadPageData(pageName) {
  try {
    switch (pageName) {
      case "home_content":
        await loadDashBoardState();
        break;
      case "users":
        await loadUsersData();
        break;
      case "category":
        await loadCategoriesData();
        break;
      case "products":
        await loadProductsData();
        break;
      case "orders":
        await loadOrdersData();
        break;
    }
  } catch (err) {
    console.log("Error loading page data:", error);
    mainContent.innerHTML = "<p>error</p>";
  } finally {
    hideLoading();
  }
}
//  PAGE NAVIGATION SETUP 
export function setupNavigation() {
  const homePageContent = document.getElementById("homePageContent");
  const usersPageContent = document.getElementById("usersPageContent");
  const categoryPageContent = document.getElementById("categoryPageContent");
  const productPageContent = document.getElementById("productPageContent");
  const orderPageContent = document.getElementById("orderPageContent");
  homePageContent.onclick = function (e) {
    e.preventDefault();
    setActiveLink(this);
    loadPage("../admin/home_content.html");
  };
  usersPageContent.onclick = function (e) {
    e.preventDefault();
    setActiveLink(this);
    loadPage("../admin/users.html");
  };
  categoryPageContent.onclick = function (e) {
    e.preventDefault();
    setActiveLink(this);
    loadPage("../admin/category.html");
  };
  productPageContent.onclick = function (e) {
    e.preventDefault();
    setActiveLink(this);
    loadPage("../admin/products.html");
  };
  orderPageContent.onclick = function (e) {
    e.preventDefault();
    setActiveLink(this);
    loadPage("../admin/orders.html");
  };
  window.addEventListener("DOMContentLoaded", () => {
    setActiveLink(homePageContent);
    loadPage("../admin/home_content.html");
  });
}
