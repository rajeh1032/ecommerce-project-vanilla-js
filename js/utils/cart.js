import { CartService } from "../services/cart.service.js";

export function getCart() {
  return CartService.getCart();
}

export function addToCart(product, quantity = 1) {
  return CartService.addToCart(product, quantity);
}

export function clearCart() {
  CartService.clearCart();
}
