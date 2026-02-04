// js/checkout.js
import { 
  db, 
  collection, 
  getDocs, 
  addDoc, 
  query, 
  where, 
  deleteDoc, 
  doc 
} from './config/firebase.js';
import { getUserUID, getUserEmail, isUserLoggedIn } from './utils/userStorage.js';
// Global variables
let currentCart = [];
let currentShippingType = 'standard';

// Initialize page
async function initPage() {
    try {
        // Check if user is logged in
        if (isUserLoggedIn()) {
            await loadCart(getUserUID());
            setupEventListeners();
        } else {
            // Redirect to login if not authenticated
            showError('Please login to continue');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        }
    } catch (error) {
        console.error('Error initializing page:', error);
        showError('Failed to load. Please refresh the page.');
    }
}

// Load cart items from Firebase
async function loadCart(userId) {
    try {
        const cartCollection = collection(db, 'cart');
        const q = query(cartCollection, where('userId', '==', userId));
        const cartSnapshot = await getDocs(q);
        
        const cartItems = [];
        cartSnapshot.forEach((docSnap) => {
            cartItems.push({
                id: docSnap.id,
                ...docSnap.data()
            });
        });

        if (cartItems.length === 0) {
            showError('Your cart is empty');
            return;
        }

        currentCart = cartItems;
        displayCart(cartItems);
    } catch (error) {
        console.error('Error loading cart:', error);
        showError('Failed to load cart from Firebase.');
    }
}

// Display cart items
function displayCart(cartItems) {
    const orderItemsContainer = document.getElementById('orderItems');
    const itemCountElement = document.getElementById('itemCount');
    
    if (!cartItems || cartItems.length === 0) {
        orderItemsContainer.innerHTML = `
            <div class="empty-state">
                <p>Your cart is empty</p>
            </div>
        `;
        itemCountElement.textContent = '0';
        updateTotals();
        return;
    }

    let itemsHTML = '';
    cartItems.forEach(item => {
        const price = parseFloat(item.price) || 0;
        const quantity = parseInt(item.quantity) || 1;
        const itemTotal = price * quantity;

        itemsHTML += `
            <div class="order-item">
                <div class="item-image">
                    ${item.imageUrl ? 
                        `<img src="${item.imageUrl}" alt="${escapeHtml(item.productName || 'Product')}">` :
                        `<div class="placeholder-image">📦</div>`
                    }
                </div>
                <div class="item-details">
                    <h3 class="item-title">${escapeHtml(item.productName || item.details || 'Product')}</h3>
                    <p class="item-brand">Brand: Aladdin</p>
                    <div class="item-rating">${'⭐'.repeat(5)}</div>
                    <p class="item-price">$${itemTotal.toFixed(2)}</p>
                    ${quantity > 1 ? `<p class="item-quantity">Qty: ${quantity}</p>` : ''}
                </div>
            </div>
        `;
    });

    orderItemsContainer.innerHTML = itemsHTML;
    itemCountElement.textContent = cartItems.length;
    
    const itemCountContainer = document.querySelector('.items-count');
    if (itemCountContainer) {
        itemCountContainer.innerHTML = `<span id="itemCount">${cartItems.length}</span> Item${cartItems.length !== 1 ? 's' : ''}`;
    }

    updateTotals();
}

// Update totals
function updateTotals() {
    if (!currentCart || currentCart.length === 0) {
        document.getElementById('subtotal').textContent = '$0.00';
        document.getElementById('shippingCost').textContent = 'Free';
        document.getElementById('orderTotal').textContent = '$0.00';
        return;
    }

    const subtotal = currentCart.reduce((sum, item) => {
        const price = parseFloat(item.price) || 0;
        const quantity = parseInt(item.quantity) || 1;
        return sum + (price * quantity);
    }, 0);

    const shippingCost = currentShippingType === 'express' ? 12.87 : 0;
    const total = subtotal + shippingCost;

    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('shippingCost').textContent = shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`;
    document.getElementById('orderTotal').textContent = `$${total.toFixed(2)}`;
}

// Setup event listeners
function setupEventListeners() {
    const shippingOptions = document.querySelectorAll('input[name="shipping"]');
    shippingOptions.forEach(input => {
        input.addEventListener('change', (e) => {
            document.querySelectorAll('.shipping-option').forEach(opt => {
                opt.classList.remove('user-selected');
            });
            e.target.closest('.shipping-option').classList.add('user-selected');
            
            currentShippingType = e.target.value;
            updateTotals();
        });
    });

    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.addEventListener('click', handleSubmit);
    }
}

// Handle submit order
async function handleSubmit() {
    if (!isUserLoggedIn()) {
        alert('Please login to submit order');
        return;
    }

    if (!currentCart || currentCart.length === 0) {
        alert('Your cart is empty');
        return;
    }

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    try {
        // Calculate totals
        const subtotal = currentCart.reduce((sum, item) => {
            const price = parseFloat(item.price) || 0;
            const quantity = parseInt(item.quantity) || 1;
            return sum + (price * quantity);
        }, 0);

        const shippingCost = currentShippingType === 'express' ? 12.87 : 0;
        const total = subtotal + shippingCost;

        // Create order object
        const orderData = {
            userId: getUserUID(),
            userEmail: getUserEmail() || '',
            items: currentCart.map(item => ({
                productId: item.productId || '',
                productName: item.productName || item.details || '',
                price: parseFloat(item.price) || 0,
                quantity: parseInt(item.quantity) || 1,
                imageUrl: item.imageUrl || ''
            })),
            subtotal: subtotal,
            shippingType: currentShippingType,
            shippingCost: shippingCost,
            total: total,
            status: 'Pending',
            createdAt: new Date().toISOString(),
            orderDate: new Date().toISOString()
        };

        // Add order to Firebase
        const ordersCollection = collection(db, 'orders');
        await addDoc(ordersCollection, orderData);

        // Clear cart after successful order
        await clearCart(getUserUID());

        // Show success message
        showSuccess();

        // Redirect to orders page after 2 seconds
        setTimeout(() => {
            window.location.href = 'order.html';
        }, 2000);

    } catch (error) {
        console.error('Error submitting order:', error);
        alert('Failed to submit order. Please try again.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit';
    }
}

// Clear cart after order
async function clearCart(userId) {
    try {
        const cartCollection = collection(db, 'cart');
        const q = query(cartCollection, where('userId', '==', userId));
        const cartSnapshot = await getDocs(q);
        
        const deletePromises = [];
        cartSnapshot.forEach((document) => {
            deletePromises.push(deleteDoc(doc(db, 'cart', document.id)));
        });

        await Promise.all(deletePromises);
    } catch (error) {
        console.error('Error clearing cart:', error);
    }
}

// Show success message
function showSuccess() {
    document.getElementById('overlay').classList.add('show');
    document.getElementById('successMessage').classList.add('show');
}

// Show error
function showError(message) {
    const orderItemsContainer = document.getElementById('orderItems');
    orderItemsContainer.innerHTML = `
        <div class="error-message">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <p>${escapeHtml(message)}</p>
            <button onclick="location.href='cart.html'" class="retry-btn">Go to Cart</button>
        </div>
    `;
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// To hide shipping options, uncomment the line below:
// document.getElementById('shippingOptions').classList.add('hidden');

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initPage);

// Add this JavaScript code to your page
document.getElementById('submitBtn').addEventListener('click', function(e) {
    e.preventDefault(); // لو الزرار جوا form
    
    // هنا ممكن تحطي الكود بتاع حفظ البيانات في Firebase أو أي حاجة
    // بعد كده نروح على صفحة completed
    
    window.location.href = 'completed.html';
});