import { loadHeaderFooter } from "./utilis.mjs";
import ShoppingCart from "./shoppingCart.mjs";

loadHeaderFooter();

const cart = new ShoppingCart("so-cart", document.querySelector(".product-list"));
cart.renderCartContents();