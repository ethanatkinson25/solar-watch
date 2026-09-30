import { getLocalStorage, renderListWithTemplate, setLocalStorage } from "./utilis.mjs";
import { loadHeaderFooter } from "./utilis.mjs";

loadHeaderFooter();

// Builds the HTML for a single cart item row.
function cartItemTemplate(item) {
  return `
    <li class="cart-card divider">
      <a href="#" class="cart-card__image">
        <img src="${item.Image}" alt="${item.Name}" />
      </a>
      <a href="#">
        <h2 class="card__name">${item.Name}</h2>
      </a>
      <p class="cart-card__color">${item.Colors?.[0]?.ColorName || "Standard"}</p>
      <p class="cart-card__quantity">qty: ${item.Quantity ?? 1}</p>
      <p class="cart-card__price">$${item.FinalPrice}</p>
    </li>
  `;
}

export default class ShoppingCart {
  // Stores the storage key and the cart container element.
  constructor(key, listElement) {
    this.key = key;
    this.listElement = listElement;
  }

  // Returns the cart items from localStorage as an array.
  getItems() {
    const items = getLocalStorage(this.key);
    return Array.isArray(items) ? items : [];
  }

  addItem(product) {
    const items = this.getItems();
    const productId = product.id ?? product.Id;
    const existingItem = items.find(
      (item) => String(item.Id ?? item.id) === String(productId),
    );

    if (existingItem) {
      existingItem.Quantity = Number(existingItem.Quantity ?? existingItem.quantity ?? 1) + 1;
    } else {
      items.push({
        Id: productId,
        Name: product.title || product.Name || product.NameWithoutBrand || "Product",
        Image: product.image || product.Image || product.Images?.PrimaryMedium || "",
        FinalPrice: Number(product.price ?? product.FinalPrice ?? 0),
        Colors: product.Colors?.length
          ? product.Colors
          : [{ ColorName: product.category || product.Category?.Name || "Standard" }],
        Quantity: 1,
      });
    }

    setLocalStorage(this.key, items);
  }

  // Renders the cart contents or an empty-state message.
  renderCartContents() {
    const cartItems = this.getItems();

    if (cartItems.length === 0) {
      this.listElement.innerHTML = "<p>Your cart is empty.</p>";
      return;
    }

    renderListWithTemplate(cartItemTemplate, this.listElement, cartItems);
  }
}
