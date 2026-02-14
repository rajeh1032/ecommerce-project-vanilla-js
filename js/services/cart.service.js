import {
  auth,
  db,
  doc,
  getDoc,
  onAuthStateChanged,
  setDoc,
} from "../config/firebase.js";

const CART_KEY = "cart";
let isInitialized = false;

export var CartService = {
  init() {
    if (isInitialized) return;
    isInitialized = true;

    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        localStorage.removeItem(CART_KEY);
        this.notifyCartUpdated();
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        const serverCart = userSnap.exists() ? userSnap.data().cart : null;

        if (Array.isArray(serverCart)) {
          localStorage.setItem(CART_KEY, JSON.stringify(serverCart));
          this.notifyCartUpdated();
        }
      } catch (error) {
        console.error("Cart sync (read) error:", error);
      }
    });
  },

  getCart() {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  },

  saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    this.syncCartToFirestore(cart);
    this.notifyCartUpdated();
  },

  async syncCartToFirestore(cart) {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, "users", user.uid);
      await setDoc(
        userRef,
        {
          cart,
          cartUpdatedAt: new Date().toISOString(),
        },
        { merge: true },
      );
    } catch (error) {
      console.error("Cart sync (write) error:", error);
    }
  },

  notifyCartUpdated() {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("cart:updated"));
    }
  },

  addToCart(product, qty = 1) {
    const cart = this.getCart();
    const existingItem = cart.find((i) => i.id === product.id);
    const stock = product.quantity;

    if (product.status === "out-stock") {
      return { success: false, message: "Product is out of stock" };
    }

    if (existingItem) {
      if (existingItem.quantity >= stock) {
        return { success: false, message: "Reached maximum stock" };
      }

      existingItem.quantity += qty;

      if (existingItem.quantity > stock) {
        existingItem.quantity = stock;
      }
    } else {
      if (qty > stock) qty = stock;

      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        quantity: qty,
        stock: stock,
      });
    }

    this.saveCart(cart);
    return { success: true, message: "Product added to cart" };
  },

  changeQty(index, delta) {
    const cart = this.getCart();
    if (!cart[index]) return;

    const item = cart[index];

    item.quantity += delta;

    if (item.quantity < 1) {
      item.quantity = 1;
    }

    if (item.quantity > item.stock) {
      item.quantity = item.stock;
    }

    this.saveCart(cart);
  },
  removeItem(index) {
    const cart = this.getCart();
    cart.splice(index, 1);
    this.saveCart(cart);
  },

  clearCart() {
    this.saveCart([]);
  },
};

CartService.init();
