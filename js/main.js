import { CategoryService } from "./services/category.service.js";
import { CategoriesUI } from "./ui/renderCategories.js";
import { ProductService } from "./services/product.service.js";
import { ProductsUI } from "./ui/renderProducts.js";
import { CartUI } from "./ui/renderCart.js";
import { ProductDetailsService } from "./services/product-details.service.js";
import { ProductDetailsUI } from "./ui/renderProductDetails.js";
import { SearchUI } from "./ui/renderSearch.js";
import { auth } from "./config/firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import { CartService } from "./services/cart.service.js";

window.onload = function () {
  if (document.querySelector(".categories-grid")) {
    CategoriesUI.showLoading();
    CategoryService.getAllCategories(function (categories) {
      CategoriesUI.renderCategoriesGrid(categories);
    });
  }
};

document.addEventListener("DOMContentLoaded", function () {
  SearchUI.initSearch();
  const urlParams = new URLSearchParams(window.location.search);
  const catId = urlParams.get("category");
  if (document.querySelector(".products-content")) {
    ProductsUI.showLoading();
    CategoryService.getAllCategories(function (categories) {
      ProductsUI.renderCategoriesSidebar(categories, catId);
      if (catId) {
        const activeCat = categories.find((c) => c.id === catId);
        ProductsUI.updatePageTitle(activeCat ? activeCat.name : "Category");
      }
    });

    const searchApplied = SearchUI.applySearchFromURL();

    if (!searchApplied) {
      if (catId) {
        ProductService.getProductsByCategory(catId, function (products) {
          ProductsUI.renderProductsGrid(products);
        });
      } else {
        ProductService.getAllProducts(function (products) {
          ProductsUI.renderProductsGrid(products);
          ProductsUI.updatePageTitle("All Products");
        });
      }
    }
  }

  // cart
  CartUI.renderCart();
  const orderBtn = document.querySelector(".order");
  if (orderBtn) {
    orderBtn.addEventListener("click", () => {
      const cart = CartService.getCart();
      if (cart.length > 0) {
        CartUI.renderCart();
      }
    });
  }

  // product details
  const productDetailsPage =
    document.querySelector(".product-details-container") ||
    document.getElementById("product-name");
  if (productDetailsPage) {
    const productId = urlParams.get("id");
    if (productId) {
      ProductDetailsUI.showLoading();
      ProductDetailsService.getProductById(productId, function (product) {
        if (product) {
          ProductDetailsUI.renderProductDetails(product);
        } else {
          ProductDetailsUI.showError("Product not found");
        }
      });
    }
  }

  // favorites
  const favoritesContainer = document.querySelector(".favorites-grid");
  if (favoritesContainer) {
    if (typeof FavoritesUI !== "undefined") {
      FavoritesUI.renderFavorites();
    }
    return;
  }

  // Slider
  const sliderData = [
    {
      title: "Get the new <br> <span class='highlight'>beauty buzz.</span>",
      desc: "The latest, greatest & freshest from your fave brands.",
      img: "assets/images/makeup.png",
      link: "public/product.html",
    },
    {
      title: "The new year <br> looks good.",
      desc: "Add vitamins & collagen to your supplement routine to keep it going strong.",
      img: "assets/images/skincare.png",
      link: "public/product.html",
    },
    {
      title: "Handy kitchen <br> appliances",
      desc: "Discover top tools & gadgets to make easy ( & tasty ) meals.",
      img: "assets/images/3.png",
      link: "public/product.html",
    },
  ];

  const wrapper = document.getElementById("slider-wrapper");
  let currentIndex = 0;

  function renderSlider() {
    wrapper.innerHTML = sliderData
      .map(
        (slide, index) => `
            <div class="slide ${index === 0 ? "active" : ""}">
                <div class="hero-content">
                    <h1>${slide.title}</h1>
                    <p>${slide.desc}</p>
                    <button onclick="window.location.href='${slide.link}'">Shop now</button>
                </div>
                <div class="hero-image">
                    <img src="${slide.img}" alt="Hero Image">
                </div>
            </div>
        `,
      )
      .join("");
  }

  renderSlider();

  const slides = document.querySelectorAll(".slide");

  function showSlide(index) {
    slides.forEach((s) => s.classList.remove("active"));

    currentIndex = index;
    if (currentIndex >= slides.length) currentIndex = 0;
    if (currentIndex < 0) currentIndex = slides.length - 1;

    slides[currentIndex].classList.add("active");
  }

  document
    .getElementById("nextBtn")
    .addEventListener("click", () => showSlide(currentIndex + 1));
  document
    .getElementById("prevBtn")
    .addEventListener("click", () => showSlide(currentIndex - 1));

  setInterval(() => showSlide(currentIndex + 1), 3000);
});

window.changeQty = function (index, delta) {
  CartService.changeQty(index, delta);
  CartUI.renderCart();
  updateCartBadge();
};

window.removeFromCart = function (index) {
  CartService.removeItem(index);
  CartUI.renderCart();
  updateCartBadge();
};

// cart quantity change handler
function updateCartBadge() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const totalItems = cart.reduce(
    (total, item) => total + (item.quantity || 0),
    0,
  );
  const cartBadge = document.getElementById("cart-count");

  if (cartBadge) {
    cartBadge.textContent = totalItems;
    cartBadge.style.display = totalItems > 0 ? "flex" : "none";
  }
}

document.addEventListener("DOMContentLoaded", updateCartBadge);
window.updateGlobalCartCount = updateCartBadge;

function updateFavoritesBadge() {
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  const totalFavs = favorites.length;
  const favBadge = document.getElementById("fav-count");

  if (favBadge) {
    favBadge.textContent = totalFavs;
    favBadge.style.display = totalFavs > 0 ? "flex" : "none";
  }
}
document.addEventListener("DOMContentLoaded", updateFavoritesBadge);
window.updateGlobalFavCount = updateFavoritesBadge;

//ي log out
const logoutBtn = document.getElementById("logoutBtn");
logoutBtn.addEventListener("click", async () => {
  signOut(auth)
    .then(() => {
      if (window.location.pathname.includes("index.html")) {
        window.location.href = "public/login.html";
      } else {
        window.location.href = "login.html";
      }
    })
    .catch((error) => {
      console.error("Logout error:", error);
    });
});
