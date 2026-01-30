import { db } from "../config/firebase.js";
import { collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

export var CategoryService = {
getAllCategories: async function(callback) {
    var querySnapshot = await getDocs(collection(db, 'categories'));
    var categories = [];
    
    querySnapshot.forEach((doc) => {
    var category = doc.data();
    category.id = doc.id;
    categories.push(category);
    });
    callback(categories);
},
getCategoryById: async function(categoryId, callback) {
    var docRef = doc(db, 'categories', categoryId);
    var docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
    var category = docSnap.data();
    category.id = docSnap.id;
    callback(category);
    }
    else {
    callback(null);
    }
}
};