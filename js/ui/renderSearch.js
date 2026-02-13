import { SearchService } from "../services/search.service.js";
import { ProductsUI } from "./renderProducts.js";

export var SearchUI = {
  initSearch: function () {
    var searchInput = document.getElementById("search-input");
    var categoryFilter = document.getElementById("category-filter");

    if ( !searchInput) {
      console.log("Search elements not found");
      return;
    }

    this.loadCategoriesFilter();


    searchInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        SearchUI.performSearch();
      }
    });

    if (categoryFilter) {
      categoryFilter.addEventListener("change", function () {
        SearchUI.performSearch();
      });
    }
  },

  loadCategoriesFilter: function () {
    var categoryFilter = document.getElementById("category-filter");
    if (!categoryFilter) return;

    SearchService.getCategoriesForFilter(function (categories) {
      categoryFilter.innerHTML = '<option value="all">All Categories</option>';

      categories.forEach(function (category) {
        var option = document.createElement("option");
        option.value = category.id;
        option.textContent = category.name;
        categoryFilter.appendChild(option);
      });
    });
  },

  performSearch: function () {
    var searchInput = document.getElementById("search-input");
    var categoryFilter = document.getElementById("category-filter");

    var searchTerm = searchInput ? searchInput.value.trim() : "";
    var categoryId = categoryFilter ? categoryFilter.value : "all";

    var productsGrid = document.querySelector(".products-grid");
    if (productsGrid) {
      this.searchAndDisplay(searchTerm, categoryId);
    } else {
      this.redirectToProductsPage(searchTerm, categoryId);
    }
  },

  searchAndDisplay: function (searchTerm, categoryId) {
    var productsGrid = document.querySelector(".products-grid");
    if (!productsGrid) return;

    productsGrid.innerHTML =
      '<p class="loading-text" style="grid-column: 1/-1; text-align: center;">Searching...</p>';

    var titleElement = document.getElementById("current-category");
    if (titleElement) {
      if (searchTerm) {
        titleElement.textContent = 'Search Results for: "' + searchTerm + '"';
      } else if (categoryId !== "all") {
        titleElement.textContent = "Filtered Products";
      } else {
        titleElement.textContent = "All Products";
      }
    }

    SearchService.searchProducts(searchTerm, categoryId, function (products) {
      if (products.length === 0) {
        productsGrid.innerHTML =
          '<p class="no-data" style="grid-column: 1/-1; text-align: center; padding: 50px; color: #999;">No products found matching your search.</p>';
      } else {
        ProductsUI.renderProductsGrid(products);
      }
    });
  },

  redirectToProductsPage: function (searchTerm, categoryId) {
    var url = "public/product.html";
    var params = [];

    if (searchTerm) {
      params.push("search=" + encodeURIComponent(searchTerm));
    }

    if (categoryId && categoryId !== "all") {
      params.push("category=" + encodeURIComponent(categoryId));
    }

    if (params.length > 0) {
      url += "?" + params.join("&");
    }

    window.location.href = url;
  },

  getSearchParams: function () {
    var urlParams = new URLSearchParams(window.location.search);
    return {
      searchTerm: urlParams.get("search") || "",
      categoryId: urlParams.get("category") || "all",
    };
  },

  applySearchFromURL: function () {
    var params = this.getSearchParams();
    var searchInput = document.getElementById("search-input");
    var categoryFilter = document.getElementById("category-filter");

    if (searchInput && params.searchTerm) {
      searchInput.value = params.searchTerm;
    }

    if (categoryFilter && params.categoryId) {
      categoryFilter.value = params.categoryId;
    }

    if (params.searchTerm || params.categoryId !== "all") {
      this.searchAndDisplay(params.searchTerm, params.categoryId);
      return true;
    }

    return false;
  },
};
