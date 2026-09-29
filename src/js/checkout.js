import { getLocalStorage, loadHeaderFooter, alertMessage } from "./utilis.mjs";
import CheckoutProcess from "./checkoutProcess.mjs";

loadHeaderFooter();

const form = document.querySelector("#checkout-form");
const checkout = new CheckoutProcess("so-cart", ".order-summary");

checkout.init();
checkout.calculateOrderTotal();

form?.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  checkout.list = getLocalStorage("so-cart") || [];
  checkout.calculateOrderTotal();

  try {
    const response = await checkout.checkout(form);
    console.log("Order submitted successfully", response);
    form.reset();
    localStorage.removeItem("so-cart");
    checkout.init();
    checkout.calculateOrderTotal();
    window.location.href = "./success.html";
  } catch (error) {
    console.error("Checkout failed", error);
    const errorMessage =
      error?.message && typeof error.message === "object"
        ? JSON.stringify(error.message)
        : error?.message || "There was a problem submitting your order. Please try again.";

    alertMessage(errorMessage);
  }
});