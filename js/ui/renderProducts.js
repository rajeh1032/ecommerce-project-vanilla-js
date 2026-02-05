export var ProductsUI = {

  renderProductsGrid: function(products) {
    var container = document.querySelector('.products-grid');
    container.innerHTML = '';

    if (!products || products.length === 0) {
      container.innerHTML = '<p class="no-data">No products found</p>';
      return;
    }
    for (var i = 0; i < products.length; i++) {
      var product = products[i];
      var productCard = this.createProductCard(product);
      container.appendChild(productCard);
    }
  },
  
  createProductCard: function(product) {
    var card = document.createElement('div');
    card.className = 'product-card';
    card.setAttribute('data-product-id', product.id);
    
    var imgContainer = document.createElement('div');
    imgContainer.className = 'product-image';
    
    var favBtn = document.createElement('button');
    favBtn.className = 'fav-btn';
    var favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    var isFav = favorites.some(f => f.id === product.id);

    favBtn.innerHTML = isFav ? 
        '<span class="material-icons" style="color:red">favorite</span>' : 
        '<span class="material-icons">favorite_border</span>';

    favBtn.onclick = function(e) {
        e.stopPropagation();
        ProductsUI.toggleFavorite(product, this);
    };
    imgContainer.appendChild(favBtn);

    var img = document.createElement('img');
    var rawImageData = product.image || product.imageUrl;
    img.src = rawImageData.startsWith('data:image') ? rawImageData : 'data:image/png;base64,' + rawImageData;
    
    imgContainer.appendChild(img);
    card.appendChild(imgContainer);
    
    var infoContainer = document.createElement('div');
    infoContainer.className = 'product-info';
    
    var name = document.createElement('p');
    name.className = 'product-name';
    name.textContent = product.name || 'Unknown Product';
    infoContainer.appendChild(name);
    
    var price = document.createElement('p');
    price.className = 'product-price';
    price.textContent = product.price ? `$${product.price}` : '';
    infoContainer.appendChild(price);

var addBtn = document.createElement('button');
addBtn.className = 'add-to-cart';
addBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#F3F3F3">
    <path d="M440-600v-120H320v-80h120v-120h80v120h120v80H520v120h-80ZM280-80q-33 0-56.5-23.5T200-160q0-33 23.5-56.5T280-240q33 0 56.5 23.5T360-160q0 33-23.5 56.5T280-80Zm400 0q-33 0-56.5-23.5T600-160q0-33 23.5-56.5T680-240q33 0 56.5 23.5T760-160q0 33-23.5 56.5T680-80ZM40-800v-80h131l170 360h280l156-280h91L692-482q-11 20-29.5 31T622-440H324l-44 80h480v80H280q-45 0-68.5-39t-1.5-79l54-98-144-304H40Z"/>
    </svg>
`;

addBtn.onclick = function(e) {
    e.stopPropagation();
    ProductsUI.addToCart(product, 1);
};
    infoContainer.appendChild(addBtn);

    card.appendChild(infoContainer);

card.onclick = function() {
    window.location.href = `public/product_details.html?id=${product.id}`;
};
    
    return card;
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
        this.showSuccessMessage(`${product.name} added to cart!`);
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
        notification.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #24A5C0; color: white; padding: 15px 20px; border-radius: 5px; z-index: 9999; box-shadow: 0 4px 12px rgba(0,0,0,0.1);';
        
        document.body.appendChild(notification);

        setTimeout(function() {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.5s ease';
            setTimeout(function() {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 500);
        }, 2500);
    },
    


renderCategoriesSidebar: function(categories, activeCategoryId) {
    var categoryList = document.querySelector('.category-list');
    if (!categoryList) return;
    
    categoryList.innerHTML = '';

    categories.forEach(category => {
      var item = document.createElement('li');
      item.className = 'category-item' + (category.id === activeCategoryId ? ' active' : '');
      
      var link = document.createElement('a');
      link.href = 'public/product.html?category=' + category.id;
      link.textContent = category.name;
      
      item.appendChild(link);
      categoryList.appendChild(item);
    });
  },
  
  updatePageTitle: function(categoryName) {
    var titleElement = document.getElementById('current-category');
    if (titleElement) {
      titleElement.textContent = categoryName || ''; 
    }
  },

  toggleFavorite: function(product, btnElement) {
        var favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        var index = -1;
        
        for (var i = 0; i < favorites.length; i++) {
            if (favorites[i].id === product.id) {
                index = i;
                break;
            }
        }

        if (index === -1) {
            favorites.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image || product.imageUrl
            });
            btnElement.innerHTML = '<span class="material-icons" style="color:red">favorite</span>';
            this.showSuccessMessage(`${product.name} added to favorites!`);
        } else {
            favorites.splice(index, 1);
            btnElement.innerHTML = '<span class="material-icons">favorite_border</span>';
            this.showSuccessMessage(`${product.name} removed from favorites!`);
        }

        localStorage.setItem('favorites', JSON.stringify(favorites));
    },

    showSuccessMessage: function(message) {
        var notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.textContent = message;
        notification.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #4CAF50; color: white; padding: 15px 20px; border-radius: 5px; z-index: 9999; box-shadow: 0 4px 12px rgba(0,0,0,0.1);';
        
        document.body.appendChild(notification);

        setTimeout(function() {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.5s ease';
            setTimeout(function() {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 500);
        }, 2500);
    },
  
  showLoading: function() {
    var container = document.querySelector('.products-grid');
    var title = document.getElementById('current-category');
    
    if (title) title.textContent = 'Loading...'; 
    if (container) {
      container.innerHTML = '<p class="loading-text" style="grid-column: 1/-1; text-align: center;">Loading products...</p>';
    }
  }

};

