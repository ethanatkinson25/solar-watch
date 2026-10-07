import { loadHeaderFooter } from "./utilis.mjs";
import ShoppingCart from "./shoppingCart.mjs";
import { updateTotalPrice } from "./cartPrice.mjs";

loadHeaderFooter();

const cart = new ShoppingCart("so-cart", document.querySelector(".product-list"));
cart.renderCartContents();
updateTotalPrice.call(cart);

// Event listener to update the total price when an item is removed from the cart
cart.listElement?.addEventListener("click", (event) => {
  if (event.target.closest("[data-remove-item]")) {
    updateTotalPrice.call(cart);
  }
});
updateTotalPrice.call(cart);

