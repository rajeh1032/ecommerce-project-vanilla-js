export var FavoritesUI = {

renderFavorites: function() {
        var favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        var container = document.querySelector('.favorites-grid');
        var titleElement = document.getElementById('current-category');

        if (!container) return;
        
        if (titleElement) titleElement.textContent = 'My Favorites';
        container.innerHTML = '';

        if (favorites.length === 0) {
            container.innerHTML = '<p class="no-data" style="grid-column: 1/-1; text-align: center; padding: 50px; color: #999;">Your wishlist is empty!</p>';
            return;
        }
        favorites.forEach(product => {
            var card = this.createFavoriteCard(product);
            container.appendChild(card);
        });
    },

createFavoriteCard: function(product) {
        var card = document.createElement('div');
        card.className = 'product-card';

        var imgContainer = document.createElement('div');
        imgContainer.className = 'product-image';

        var favBtn = document.createElement('button');
        favBtn.className = 'fav-btn';
        favBtn.innerHTML = '<span class="material-icons" style="color:red">favorite</span>';
        favBtn.onclick = (e) => {
            e.stopPropagation();
            this.removeFromFav(product.id);
        };

        var img = document.createElement('img');
        var rawImageData = product.imageUrl || product.image;
        var imgSrc = "";

        if (rawImageData) {
            if (rawImageData.startsWith('http') || rawImageData.startsWith('data:image')) {
                imgSrc = rawImageData;
            } else {
                imgSrc = rawImageData;
            }
        }

        img.src = imgSrc;
        img.alt = product.name;
        imgContainer.appendChild(favBtn);
        imgContainer.appendChild(img);
        card.appendChild(imgContainer);

        var infoContainer = document.createElement('div');
        infoContainer.className = 'product-info';

        var name = document.createElement('p');
        name.className = 'product-name';
        name.textContent = product.name;

        var price = document.createElement('p');
        price.className = 'product-price';
        price.textContent = `${product.price} EGP`;


        infoContainer.appendChild(name);
        infoContainer.appendChild(price);        
        card.appendChild(infoContainer);

        card.onclick = () => {
            window.location.href = `product_details.html?id=${product.id}`;
        };
        return card;
    },

removeFromFav: function(productId) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favorites = favorites.filter(f => f.id !== productId);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    
    this.renderFavorites();
    
    if (window.updateGlobalFavCount) {
        window.updateGlobalFavCount();
    }
},


showSuccessMessage: function(message) {

    var notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.textContent = message;
    notification.style.cssText = 'position: fixed; top: 20px; right: 20px; background: green; color: white; padding: 15px 20px; border-radius: 5px; z-index: 9999; box-shadow: 0 4px 12px rgba(0,0,0,0.1);';
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

};