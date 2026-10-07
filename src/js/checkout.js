import { getLocalStorage, loadHeaderFooter, alertMessage } from "./utilis.mjs";
import CheckoutProcess from "./checkoutProcess.mjs";
import ShoppingCart from "./shoppingCart.mjs";
import { updateTotalPrice } from "./cartPrice.mjs";

loadHeaderFooter();

document.addEventListener("DOMContentLoaded", function() {
  if (window.location.href.indexOf('checkout/index.html') > -1) {
    const cart = new ShoppingCart("so-cart", document.querySelector(".product-list"));
    cart.renderCartContents();

    const form = document.querySelector(".checkout-form");
    const checkout = new CheckoutProcess("so-cart", ".order-summary");

    updateTotalPrice.call(cart);

    // Event listener to update the total price when an item is removed from the cart
    cart.listElement?.addEventListener("click", (event) => {
      if (event.target.closest("[data-remove-item]")) {
        updateTotalPrice.call(cart);
      }
    });

    checkout.init();
    checkout.calculateOrderTotal();

    // Handle checkout form submission
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const jsonObject = Object.fromEntries(formData.entries());
      const jsonString = JSON.stringify(jsonObject, null, 2);
      
      console.log(jsonString);
      
      localStorage.setItem('formData', jsonString);
    });
  }
});