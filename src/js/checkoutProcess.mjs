// Reads the saved cart from localStorage and returns an array, defaulting safely to empty data.
function getLocalStorage(key) {
  const stored = localStorage && localStorage.getItem(key);
  if (!stored) return [];

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

// Converts a form into a plain JavaScript object for checkout payloads.
function formDataToJSON(formElement) {
  const formData = new FormData(formElement);
  const convertedJSON = {};

  formData.forEach((value, key) => {
    convertedJSON[key] = value;
  });

  return convertedJSON;
}

export default class CheckoutProcess {
  // Stores checkout settings and totals for the current order.
  constructor(key, outputSelector, services = null) {
    this.key = key;
    this.outputSelector = outputSelector;
    this.list = [];
    this.itemTotal = 0;
    this.shipping = 0;
    this.tax = 0;
    this.orderTotal = 0;
    this.services = services;
  }

  // Loads the cart and recalculates the subtotal for the checkout page.
  init() {
    this.list = getLocalStorage(this.key);
    this.calculateItemSubTotal();
  }

  // Formats cart items into the structure expected by the backend checkout API.
  packageItems(items) {
    return items.map((item) => ({
      id: item.Id || item.id,
      name: item.Name || item.name,
      price: Number(item.FinalPrice ?? item.price ?? 0),
      quantity: Number(item.Quantity ?? item.quantity ?? 1),
    }));
  }

  // Adds together the cart totals for the order subtotal.
  calculateItemSubTotal() {
    this.itemTotal = this.list.reduce((sum, item) => {
      const price = Number(item.FinalPrice ?? item.finalPrice ?? 0);
      const quantity = Number(item.Quantity ?? item.quantity ?? 1);
      return sum + price * quantity;
    }, 0);

    const subtotal = document.querySelector(`${this.outputSelector} #subtotal`);
    if (subtotal) {
      subtotal.innerText = `$${this.itemTotal.toFixed(2)}`;
    }
  }

  // Calculates tax, shipping, and final total values for the order summary.
  calculateOrderTotal() {
    this.tax = this.itemTotal * 0.06;
    this.shipping = this.list.length === 0 ? 0 : 10 + (this.list.length - 1) * 2;
    this.orderTotal = this.itemTotal + this.tax + this.shipping;

    this.displayOrderTotals();
  }

  // Writes the tax, shipping, and total values to the checkout summary fields.
  displayOrderTotals() {
    const tax = document.querySelector(`${this.outputSelector} #tax`);
    const shipping = document.querySelector(`${this.outputSelector} #shipping`);
    const total = document.querySelector(`${this.outputSelector} #total`);

    if (tax) tax.innerText = `$${this.tax.toFixed(2)}`;
    if (shipping) shipping.innerText = `$${this.shipping.toFixed(2)}`;
    if (total) total.innerText = `$${this.orderTotal.toFixed(2)}`;
  }

  // Sends the completed order payload to the backend checkout endpoint.
  async checkout(form) {
    const formData = formDataToJSON(form);
    const payload = {
      ...formData,
      orderDate: new Date().toISOString(),
      items: this.packageItems(this.list),
      orderTotal: this.orderTotal.toFixed(2),
      shipping: this.shipping,
      tax: this.tax.toFixed(2),
    };

    try {
      if (!this.services) {
        const module = await import("./ExternalServices.mjs");
        this.services = new module.default();
      }

      return this.services.checkout(payload);
    } catch (err) {
      console.error("Checkout failed:", err);
      throw err;
    }
  }
}