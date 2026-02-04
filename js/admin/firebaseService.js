import {
  db,
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
} from "../config/firebase.js";
import { prepareImage, convertToBase64 } from "./helper.js";

// ================== CATEGORY OPERATIONS ==================
export async function getCategories() {
  try {
    const querySnapshot = await getDocs(collection(db, "categories"));
    const myCategory = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return myCategory;
  } catch (error) {
    console.error("Error getting categories:", error);
    throw error;
  }
}

export async function addCategory(categoryData, imageFile) {
  try {
    const imageUrl = await prepareImage(imageFile);
    const docRef = await addDoc(collection(db, "categories"), {
      name: categoryData.name,
      description: categoryData.description,
      imageUrl: imageUrl,
      createdAt: new Date().toISOString(),
    });
    return { id: docRef.id, success: true };
  } catch (error) {
    console.error("Error adding category:", error);
    throw error;
  }
}

export async function updateCategory(categoryId, categoryData, imageFile) {
  try {
    const categoryRef = doc(db, "categories", categoryId);
    let updateData = {
      name: categoryData.name,
      description: categoryData.description,
    };
    if (imageFile) {
      updateData.imageUrl = await convertToBase64(imageFile);
    }
    await updateDoc(categoryRef, updateData);
    return { success: true };
  } catch (error) {
    console.error("Error updating category:", error);
    throw error;
  }
}
export async function deleteCategory(categoryId) {
  try {
    await deleteDoc(doc(db, "categories", categoryId));
    return { success: true };
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
}

// ================== PRODUCT OPERATIONS ==================
export async function getProducts() {
  try {
    const querySnapshot = await getDocs(collection(db, "products"));
    const myProducts = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return myProducts;
  } catch (error) {
    console.error("Error getting products:", error);
    throw error;
  }
}

export async function addProduct(productData, imageFile) {
  try {
    let imageUrl = "";

    if (imageFile) {
      imageUrl = await convertToBase64(imageFile);
    }

    const docRef = await addDoc(collection(db, "products"), {
      name: productData.name,
      categoryID: productData.categoryID,
      imageUrl: imageUrl,
      price: parseFloat(productData.price),
      quantity: parseInt(productData.quantity),
      status: productData.status,
      createdAt: new Date().toISOString(),
    });

    return { id: docRef.id, success: true };
  } catch (error) {
    console.error("Error adding product:", error);
    throw error;
  }
}
export async function updateProduct(productId, productData, imageFile) {
  try {
    const productRef = doc(db, "products", productId);
    let updateData = {
      name: productData.name,
      categoryID: productData.categoryID,
      price: parseFloat(productData.price),
      quantity: parseInt(productData.quantity),
      status: productData.status,
    };

    if (imageFile) {
      // Convert image to base64
      updateData.imageUrl = await convertToBase64(imageFile);
    }

    await updateDoc(productRef, updateData);
    return { success: true };
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
}

export async function deleteProduct(productId) {
  try {
    await deleteDoc(doc(db, "products", productId));
    return { success: true };
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
}

// ================== USER OPERATIONS ==================
export async function getUsers() {
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    return querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));
  } catch (error) {
    console.error("Error getting users:", error);
    throw error;
  }
}

export async function updateUser(userId, userData) {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      name: userData.name,
      phone: userData.phone,
      address: userData.address,
      role: userData.role,
      status: userData.status,
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

export async function deleteUser(userId) {
  try {
    await deleteDoc(doc(db, "users", userId));
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}

// ================== ORDER OPERATIONS ==================
export async function getOrders() {
  try {
    const querySnapshot = await getDocs(collection(db, "orders"));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting orders:", error);
    throw error;
  }
}

export async function updateOrderStatus(orderId, status) {
  try {
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, {
      status: status,
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating order:", error);
    throw error;
  }
}


