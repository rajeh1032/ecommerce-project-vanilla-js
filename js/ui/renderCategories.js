export var CategoriesUI = {
  
  renderCategoriesGrid: function(categories) {
    var container = document.getElementById('categories-container');
    
    if (!container) {
      console.error("Categories container not found!");
      return;
    }
    container.innerHTML = '';
    if (!categories || categories.length === 0) {
      container.innerHTML = '<p class="no-data">No categories available</p>';
      return;
    }
    for (var i = 0; i < categories.length; i++) {
      var category = categories[i];
      var categoryCard = this.createCategoryCard(category);
      container.appendChild(categoryCard);
    }
  },
  
  createCategoryCard: function(category) {
    var card = document.createElement('div');
    card.className = 'category-card';
    card.setAttribute('data-category-id', category.id);
    var img = document.createElement('img');

    var rawImageData = category.image || category.imageUrl;

    if (rawImageData) {
      if (rawImageData.startsWith('data:image')) {
          img.src = rawImageData;
      } else {
          img.src = 'data:image/png;base64,' + rawImageData;
      }
    }

    var imgContainer = document.createElement('div');
    imgContainer.className = 'category-image';

    imgContainer.appendChild(img);
    card.appendChild(imgContainer);
    var name = document.createElement('h3');
    name.textContent = category.name || 'Unknown Category';
    card.appendChild(name);
    card.onclick = function() {
      window.location.href = 'public/product.html?category=' + category.id;
    };
    
    return card;
  },
  renderCategoriesFilter: function(categories) {
    var select = document.getElementById('category-filter');
    
    if (!select) {
      console.error("Category filter not found!");
      return;
    }
    select.innerHTML = '<option value="all">All Categories</option>';
    for (var i = 0; i < categories.length; i++) {
      var category = categories[i];
      var option = document.createElement('option');
      option.value = category.id;
      option.textContent = category.name;
      select.appendChild(option);
    }
  },
  
showLoading: function() {
    var container = document.getElementById('categories-container');
    if (container) {
        container.classList.add('loading-state');
        container.innerHTML = '<div class="spinner"></div>';
    }
},

hideLoading: function() {
    var container = document.getElementById('categories-container');
    if (container) {
        container.classList.remove('loading-state');
    }
  },


  showError: function(message) {
    var container = document.getElementById('categories-container');
    if (container) {
      container.innerHTML = '<p class="error">' + message + '</p>';
    }
  }
};