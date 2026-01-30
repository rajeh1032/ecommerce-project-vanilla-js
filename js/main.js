import { CategoryService } from "./services/category.service.js";
import { CategoriesUI } from "./ui/renderCategories.js";

window.onload = function() {
    CategoriesUI.showLoading();
    CategoryService.getAllCategories(function(categories) {
        CategoriesUI.renderCategoriesGrid(categories);
    });
};
document.addEventListener('DOMContentLoaded', function() {
    loadCategories();
    setupSearch();
    if (document.getElementById('hero-slider')) {
    setupHeroSlider();
  }
});

function loadCategories() {
  if (typeof CategoriesUI !== 'undefined') {
    CategoriesUI.showLoading();
  }
  CategoryService.getAllCategories(function(categories) {
    
    if (categories && categories.length > 0) {
      if (typeof CategoriesUI !== 'undefined') {
        CategoriesUI.renderCategoriesGrid(categories);
        CategoriesUI.renderCategoriesFilter(categories);
      }
    } else {
      if (typeof CategoriesUI !== 'undefined') {
        CategoriesUI.showError('No categories found');
      }
    }
  });
}