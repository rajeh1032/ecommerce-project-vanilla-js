import { ProductService } from "./product.service.js";
import { CategoryService } from "./category.service.js";

export var SearchService = {
    searchProducts: function(searchTerm, categoryId, callback) {
        if (categoryId && categoryId !== 'all') {
            ProductService.getProductsByCategory(categoryId, function(products) {
                var filteredProducts = SearchService.filterBySearchTerm(products, searchTerm);
                callback(filteredProducts);
            });
        } else {
            ProductService.getAllProducts(function(products) {
                var filteredProducts = SearchService.filterBySearchTerm(products, searchTerm);
                callback(filteredProducts);
            });
        }
    },

    filterBySearchTerm: function(products, searchTerm) {
        if (!searchTerm || searchTerm.trim() === '') {
            return products;
        }

        var searchTermLower = searchTerm.toLowerCase().trim();
        var filteredProducts = [];

        for (var i = 0; i < products.length; i++) {
            var product = products[i];
            var productName = product.name ? product.name.toLowerCase() : '';
            var productDesc = product.description ? product.description.toLowerCase() : '';
            
            if (productName.indexOf(searchTermLower) !== -1 || 
                productDesc.indexOf(searchTermLower) !== -1) {
                filteredProducts.push(product);
            }
        }

        return filteredProducts;
    },

    getCategoriesForFilter: function(callback) {
        CategoryService.getAllCategories(callback);
    }
};