import { db } from "../config/firebase.js";
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

export var ProductService = {
  
  getAllProducts: async function(callback) {
    var querySnapshot = await getDocs(collection(db, 'products'));
    var products = [];
    
    querySnapshot.forEach((doc) => {
      var product = doc.data();
      product.id = doc.id;
      products.push(product);
    });
    
    callback(products);
  },
  
  getProductsByCategory: async function(categoryId, callback) {
    var q = query(collection(db, 'products'), where('categoryID', '==', categoryId));
    var querySnapshot = await getDocs(q);
    var products = [];
    
    querySnapshot.forEach((doc) => {
      var product = doc.data();
      product.id = doc.id;
      products.push(product);
    });
    
    callback(products);
  },
  
  searchProducts: async function(searchTerm, callback) {
    this.getAllProducts(function(products) {
      var searchTermLower = searchTerm.toLowerCase();
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
      
      callback(filteredProducts);
    });
  }
};