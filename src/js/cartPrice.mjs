const totalPriceElement = document.querySelector(".total-price");
import ShoppingCart from "./shoppingCart.mjs";

const cart = new ShoppingCart("so-cart", document.querySelector(".product-list"));

// Function to calculate the total price of the shopping cart
export const getTotalPrice = function(shoppingCart) {
  return shoppingCart.getItems().reduce((total, item) => {
    const price = Number(item.FinalPrice ?? item.finalPrice ?? item.price ?? 0);
    const quantity = Number(item.Quantity ?? item.quantity ?? 1);
    return total + price * quantity;
  }, 0);
};

// Update the total price whenever the cart contents change
 export const updateTotalPrice = function() {
     if (window.location.href.indexOf('checkout/index.html') > -1 || window.location.href.indexOf('cart/index.html') > -1) {
       totalPriceElement.textContent = `Total: $${getTotalPrice(this).toFixed(2)}`;
     }
};

// Event listener to update the total price when an item is removed from the cart
cart.listElement?.addEventListener("click", (event) => {
  if (event.target.closest("[data-remove-item]")) {
    updateTotalPrice.call(cart);
  }
});

// Initial update of the total price
updateTotalPrice.call(cart);