export var CartService = {

  getCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
  },

  saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  },

addToCart(product, qty = 1) {
    const cart = this.getCart();
    const existingItem = cart.find(i => i.id === product.id);
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
            stock: stock
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
  }

};
