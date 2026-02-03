// js/services/order.service.js
import { 
  auth, 
  db, 
  collection, 
  getDocs, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc 
} from '../config/firebase.js';

// ============================================================
// البيانات في Firebase شكلها كده:
// {
//     userId: "...",                  ← checkout بيكتبه
//     categoryId: "HFZSehMIXy71AUrYyslK",
//     createdAt: "2025-06-17T16:43:03.112046",
//     customerName: "rajeh",
//     details: "نحاس قديم",
//     orderId: "ZjZ2kgk7SfrwfD9dlgxw",
//     phoneNumber: "010",
//     price: 100,
//     productId: "cOTbd38ClvOlc3lTwBTo",
//     quantity: 1,
//     status: "pending"
// }
// ============================================================

/**
 * Get all orders for a specific user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of order objects
 */
export async function getUserOrders(userId) {
    try {
        const ordersCollection = collection(db, 'orders');
        const q = query(
            ordersCollection, 
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );
        const ordersSnapshot = await getDocs(q);
        
        const orders = [];
        ordersSnapshot.forEach((doc) => {
            orders.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return orders;
    } catch (error) {
        console.error('Error fetching user orders:', error);
        throw error;
    }
}

/**
 * Get all completed orders
 * @returns {Promise<Array>} Array of completed order objects
 */
export async function getCompletedOrders() {
    try {
        const ordersCollection = collection(db, 'orders');
        const q = query(ordersCollection, where('status', '==', 'Completed'));
        const ordersSnapshot = await getDocs(q);
        
        const orders = [];
        ordersSnapshot.forEach((doc) => {
            orders.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return orders;
    } catch (error) {
        console.error('Error fetching completed orders:', error);
        throw error;
    }
}

/**
 * Get orders by status
 * @param {string} status - Order status (Pending, Processing, Completed, Cancelled)
 * @returns {Promise<Array>} Array of order objects
 */
export async function getOrdersByStatus(status) {
    try {
        const ordersCollection = collection(db, 'orders');
        const q = query(ordersCollection, where('status', '==', status));
        const ordersSnapshot = await getDocs(q);
        
        const orders = [];
        ordersSnapshot.forEach((doc) => {
            orders.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return orders;
    } catch (error) {
        console.error('Error fetching orders by status:', error);
        throw error;
    }
}

/**
 * Get order by ID
 * @param {string} orderId - The order ID
 * @returns {Promise<Object|null>} Order object or null
 */
export async function getOrderById(orderId) {
    try {
        const orderDoc = doc(db, 'orders', orderId);
        const orderSnapshot = await getDoc(orderDoc);
        
        if (orderSnapshot.exists()) {
            return {
                id: orderSnapshot.id,
                ...orderSnapshot.data()
            };
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error fetching order by ID:', error);
        throw error;
    }
}

/**
 * Create a new order
 * @param {Object} orderData - Order data object
 * @returns {Promise<string>} The created order ID
 */
export async function createOrder(orderData) {
    try {
        const ordersCollection = collection(db, 'orders');
        const docRef = await addDoc(ordersCollection, {
            ...orderData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        
        return docRef.id;
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
}

/**
 * Update order status
 * @param {string} orderId - Order ID
 * @param {string} newStatus - New status value
 * @returns {Promise<void>}
 */
export async function updateOrderStatus(orderId, newStatus) {
    try {
        const orderDoc = doc(db, 'orders', orderId);
        await updateDoc(orderDoc, {
            status: newStatus,
            updatedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        throw error;
    }
}

/**
 * Delete order
 * @param {string} orderId - Order ID
 * @returns {Promise<void>}
 */
export async function deleteOrder(orderId) {
    try {
        const orderDoc = doc(db, 'orders', orderId);
        await deleteDoc(orderDoc);
    } catch (error) {
        console.error('Error deleting order:', error);
        throw error;
    }
}

/**
 * Calculate order totals
 * @param {Array} items - Array of order items
 * @param {string} shippingType - Shipping type (standard/express)
 * @returns {Object} Object with subtotal, shipping, and total
 */
export function calculateOrderTotals(items, shippingType = 'standard') {
    const subtotal = items.reduce((sum, item) => {
        const price = parseFloat(item.price) || 0;
        const quantity = parseInt(item.quantity) || 1;
        return sum + (price * quantity);
    }, 0);

    const shippingCost = shippingType === 'express' ? 12.87 : 0;
    const total = subtotal + shippingCost;

    return {
        subtotal: subtotal.toFixed(2),
        shipping: shippingCost === 0 ? 'Free' : shippingCost.toFixed(2),
        shippingCost: shippingCost,
        total: total.toFixed(2)
    };
}

/**
 * Get all orders (Admin function)
 * @returns {Promise<Array>} Array of all orders
 */
export async function getAllOrders() {
    try {
        const ordersCollection = collection(db, 'orders');
        const q = query(ordersCollection, orderBy('createdAt', 'desc'));
        const ordersSnapshot = await getDocs(q);
        
        const orders = [];
        ordersSnapshot.forEach((doc) => {
            orders.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return orders;
    } catch (error) {
        console.error('Error fetching all orders:', error);
        throw error;
    }
}

/**
 * Get orders statistics
 * @param {string} userId - User ID (optional, for user-specific stats)
 * @returns {Promise<Object>} Statistics object
 */
export async function getOrdersStats(userId = null) {
    try {
        let q;
        const ordersCollection = collection(db, 'orders');
        
        if (userId) {
            q = query(ordersCollection, where('userId', '==', userId));
        } else {
            q = query(ordersCollection);
        }
        
        const ordersSnapshot = await getDocs(q);
        
        const stats = {
            total: 0,
            pending: 0,
            processing: 0,
            completed: 0,
            cancelled: 0,
            totalRevenue: 0
        };

        ordersSnapshot.forEach((doc) => {
            const order = doc.data();
            stats.total++;
            
            switch(order.status) {
                case 'Pending':
                    stats.pending++;
                    break;
                case 'Processing':
                    stats.processing++;
                    break;
                case 'Completed':
                    stats.completed++;
                    break;
                case 'Cancelled':
                    stats.cancelled++;
                    break;
            }
            
            if (order.status === 'Completed') {
                stats.totalRevenue += parseFloat(order.total) || 0;
            }
        });

        return stats;
    } catch (error) {
        console.error('Error fetching order stats:', error);
        throw error;
    }
}