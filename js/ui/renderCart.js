import { CartService } from "../services/cart.service.js";

export var CartUI = {
    renderCart: function() {
        var cart = CartService.getCart()
        var tbody = document.querySelector('.cart-table tbody');
        var cartTitle = document.querySelector('.cart-title');
        var totalPriceElement = document.querySelector('.cart-footer .total strong');
        
        if (!tbody) return;

        tbody.innerHTML = '';
        var totalAmount = 0;

        var totalItemsCount = cart.reduce((total, item) => total + (item.quantity || 0), 0);
        if (cartTitle) {
            cartTitle.textContent = `Cart (${totalItemsCount} ${totalItemsCount === 1 ? 'Item' : 'Items'})`;
        }

        if (cart.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px;">Your cart is empty</td></tr>';
            if (totalPriceElement) totalPriceElement.textContent = '$0.00';
            return;
        }

        cart.forEach((item, index) => {
            var rawData = item.imageUrl || item.image;
            var imgSrc = "";

            if (rawData) {
                if (rawData.startsWith('http') || rawData.startsWith('data:image')) {
                    imgSrc = rawData;
                } else {
                    imgSrc = 'data:image/png;base64,' + rawData;
                }
            }

            var itemTotal = item.price * item.quantity;
            totalAmount += itemTotal;

            var row = document.createElement('tr');
            row.innerHTML = `
                <td class="info">
                    <img src="${imgSrc}" alt="${item.name}" 
                        style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;""> 
                    <p>${item.name}</p>
                </td>
                <td class="price">${item.price} EGP</td>
                <td class="quantity">
                    <div class="qty-controls">
                        <button onclick="changeQty(${index}, -1)">-</button>
                        <span>${String(item.quantity).padStart(2, '0')}</span>
                        <button onclick="changeQty(${index}, 1)">+</button>
                    </div>
                </td>
                <td class="total">${itemTotal.toFixed(2)} EGP</td>
                <td class="remove">
                    <button class="delete-btn" onclick="removeFromCart(${index})">
                        <span class="material-icons">delete</span>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });

        if (totalPriceElement) totalPriceElement.textContent = `$${totalAmount.toFixed(2)}`;
    }
};

window.changeQty = function(index, delta) {
    CartService.changeQty(index, delta);
    CartUI.renderCart();
    if(window.updateGlobalCartCount) window.updateGlobalCartCount();
};

window.removeFromCart = function(index) {
    CartService.removeItem(index);
    CartUI.renderCart();
    if(window.updateGlobalCartCount) window.updateGlobalCartCount();
};
