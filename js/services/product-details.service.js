import { db } from "../config/firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

export const ProductDetailsService = {
    getProductById: async function(id, callback) {
        console.log("Searching for Product ID:", id);
        try {
            const docRef = doc(db, 'products', id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const product = docSnap.data();
                product.id = docSnap.id;
                console.log("Product found:", product);
                callback(product); 
            } else {
                console.log("No such product!");
                callback(null);
            }
        } catch (error) {
            console.error("Error getting product:", error);
            callback(null);
        }
    }
};