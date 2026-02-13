import { CartService } from "../services/cart.service.js";

export var ProductDetailsUI = {
  renderProductDetails: function(product) {
    if (!product) {
        this.showError('Product not found');
        return;
    }

    var nameElement = document.getElementById('product-name');
    if (nameElement) {
        nameElement.textContent = product.name;
    }

    var priceElement = document.getElementById('product-price');
    if (priceElement) {
        priceElement.textContent = (product.price) + '$';
    }

    var descElement = document.getElementById('product-desc');
    if (descElement) {
        descElement.textContent = product.description || 'No description available';
    }

    var statusElement = document.getElementById('product-status');
    if (statusElement) {
        var isInStock = product.status === 'in-stock' ;
        statusElement.textContent = isInStock ? 'In Stock' : 'Out of Stock';
        statusElement.className = 'status-badge ' + (isInStock ? 'in-stock' : 'out-of-stock');
    }

    this.renderProductImage(product);
    this.setupQuantityControls(product);
    this.setupAddToCartButton(product);
},

renderProductImage: function(product) {
    var imageContainer = document.querySelector('.main-image');
    if (!imageContainer) return;

    imageContainer.innerHTML = '';
    
    var img = document.createElement('img');
    var rawImageData = product.imageUrl || product.image;
    var imgSrc = "";

    if (rawImageData) {
        var cleanData = rawImageData.trim();
        if (cleanData.startsWith('http') || cleanData.startsWith('data:image')) {
            imgSrc = cleanData;
        } else {
            imgSrc = 'data:image/png;base64,' + cleanData;
        }
    }
    img.src = imgSrc;

    var favBtn = document.createElement('button');
    favBtn.className = 'fav-btn';
    
    var favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    var isFav = favorites.some(f => f.id === product.id);

    favBtn.innerHTML = isFav ? 
        '<span class="material-icons" style="color:red">favorite</span>' : 
        '<span class="material-icons">favorite_border</span>';

    favBtn.onclick = (e) => {
        e.stopPropagation();
        this.toggleFavorite(product, favBtn);
    };

    imageContainer.appendChild(img);
    imageContainer.appendChild(favBtn);
},

toggleFavorite: function(product, btnElement) {
    var favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    var index = favorites.findIndex(f => f.id === product.id);

    if (index === -1) {
        favorites.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.imageUrl || product.image
        });
        btnElement.innerHTML = '<span class="material-icons" style="color:red">favorite</span>';
        this.showStatusMessage(`${product.name} added to favorites!`);
    } else {
        favorites.splice(index, 1);
        btnElement.innerHTML = '<span class="material-icons">favorite_border</span>';
        this.showStatusMessage(`${product.name} removed from favorites!`);
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));
    window.updateGlobalFavCount();
},

  setupQuantityControls: function(product) {
    var qtyInput = document.getElementById('qty-input');
    var minusBtn = document.querySelector('.qty-btn.minus');
    var plusBtn = document.querySelector('.qty-btn.plus');

    if (!qtyInput || !minusBtn || !plusBtn) return;

    qtyInput.value = 1;

    minusBtn.onclick = function() {
      var currentValue = parseInt(qtyInput.value) || 1;
      if (currentValue > 1) {
        qtyInput.value = currentValue - 1;
      }
    };

    plusBtn.onclick = function() {
      var currentValue = parseInt(qtyInput.value) || 1;
      var maxStock = product.stock || 999;
      if (currentValue < maxStock) {
        qtyInput.value = currentValue + 1;
      }
    };
  },

  setupAddToCartButton: function(product) {
    var addToCartBtn = document.querySelector('.add-to-cart-btn');
    if (!addToCartBtn) return;

    if (product.stock <= 0) {
      addToCartBtn.disabled = true;
      addToCartBtn.textContent = 'Out of Stock';
      return;
    }

    addToCartBtn.onclick = function() {
      var qtyInput = document.getElementById('qty-input');
      var quantity = parseInt(qtyInput.value) || 1;
      ProductDetailsUI.addToCart(product, quantity);
    };
  },

  setupAddToCartButton: function(product) {

    var addToCartBtn = document.querySelector('.add-to-cart-btn');
    if (!addToCartBtn) return;

    if (product.stock <= 0) {
        addToCartBtn.disabled = true;
        addToCartBtn.textContent = 'Out of Stock';
        return;
    }

  addToCartBtn.onclick = function() {
      var qtyInput = document.getElementById('qty-input');
      var quantity = parseInt(qtyInput.value) || 1;

      const result = CartService.addToCart(product, quantity);

      if(window.updateGlobalCartCount)
          window.updateGlobalCartCount();

      ProductDetailsUI.showStatusMessage(result.message, !result.success);
  }
},
  updateCartCount: function() {
    var cart = JSON.parse(localStorage.getItem('cart')) || [];
    var totalItems = 0;
    
    for (var i = 0; i < cart.length; i++) {
      totalItems += cart[i].quantity;
    }

    var cartBadge = document.getElementById('cart-count');
    if (cartBadge) {
      cartBadge.textContent = totalItems;
    }
  },

  showStatusMessage: function(message, isError = false) {
    var notification = document.createElement('div');
    const bgColor = isError ? '#f44336' : '#4CAF50';
    notification.style.cssText = `position: fixed; top: 20px; right: 20px; background: ${bgColor}; color: white; padding: 15px 20px; border-radius: 5px; z-index: 9999;`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(function() {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(function() {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  },

showLoading: function() {
    console.log("Loading data..."); 
},

showError: function(message) {
    var nameElement = document.getElementById('product-name');
    if (nameElement) nameElement.textContent = "Error: " + message;
}
};