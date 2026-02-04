export function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

export function addToCart(product, quantity = 1) {
  const cart = getCart();
  const qty = Number(quantity);

  const index = cart.findIndex((item) => item.id === product.id);

  if (index !== -1) {
    cart[index].quantity += qty;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || product.imageUrl,
      quantity: qty,
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
}

export function clearCart() {
  localStorage.removeItem("cart");
}
