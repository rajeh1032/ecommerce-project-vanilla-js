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
        priceElement.textContent = (product.price) + ' EGP';
    }

    var descElement = document.getElementById('product-desc');
    if (descElement) {
        descElement.textContent = product.description || 'No description available';
    }

    var statusElement = document.getElementById('product-status');
    if (statusElement) {
        var isInStock = product.status === 'inStock' || product.quantity > 0;
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
    
    var rawImageData = product.imageUrl;
    
    if (rawImageData)
        img.src = 'data:image/png;base64,' + rawImageData;

    
    img.alt = product.name || 'Product Image';
    imageContainer.appendChild(img);
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

  addToCart: function(product, quantity) {
    var cart = JSON.parse(localStorage.getItem('cart')) || [];
    var existingItemIndex = -1;
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].id === product.id) {
        existingItemIndex = i;
        break;
      }
    }

    if (existingItemIndex !== -1) {
      cart[existingItemIndex].quantity += quantity;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image || product.imageUrl,
        quantity: quantity
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));

    this.updateCartCount();

    this.showSuccessMessage('Product added to cart successfully!');
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

  showSuccessMessage: function(message) {
    var notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.textContent = message;
    notification.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #4CAF50; color: white; padding: 15px 20px; border-radius: 5px; z-index: 9999; animation: slideIn 0.3s ease;';
    
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