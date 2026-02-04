// js/services/order.service.js
import {
  db,
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from "../config/firebase.js";

export async function fetchOrdersByUserId(userId) {
  try {
    const ordersCollection = collection(db, "orders");
    const q = query(ordersCollection, where("userId", "==", userId));
    const ordersSnapshot = await getDocs(q);

    const orders = [];
    ordersSnapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return orders;
  } catch (error) {
    console.error("Error fetching user orders:", error);
    throw error;
  }
}
