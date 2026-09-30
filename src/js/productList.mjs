import { renderListWithTemplate } from "./utilis.mjs";
import { loadHeaderFooter } from "./utilis.mjs";
import ShoppingCart from "./shoppingCart.mjs";

loadHeaderFooter();

const pagePaths = {
  "880RR": "product_pages/marmot-ajax-3.html",
  "985RF": "product_pages/northface-talus-4.html",
  "985PR": "product_pages/northface-alpine-3.html",
  "344YJ": "product_pages/cedar-ridge-rimrock-2.html",
};

// Builds the HTML markup for a single product card.
function productCardTemplate(product, category) {
  const imageUrl = product.image || product.Images?.PrimaryMedium || product.Image || "";
  const brandName = product.category || product.Brand?.Name || "";
  const productName = product.title || product.NameWithoutBrand || product.Name || "Product";
  const price = product.price ?? product.FinalPrice ?? 0;
  const productPage = pagePaths[product.Id];
  const href = productPage
    ? `${productPage}?product=${product.Id}&category=${category}`
    : "#";

  return `
    <li class="product-card">
      <a href="${href}">
        <img src="${imageUrl}" alt="${productName}">
        <h3 class="card__brand">${brandName}</h3>
        <h2 class="card__name">${productName}</h2>
        <p class="product-card__price">$${Number(price).toFixed(2)}</p>
      </a>
      <button class="add-to-cart" type="button" data-add-to-cart data-product-id="${product.id ?? product.Id}" aria-label="Add ${productName} to cart">Add to cart</button>
    </li>
    `;
}

export default class ProductList {
  // Stores the category, data source, and target container for the list.
  constructor(category, dataSource, listElement, searchQuery = "") {
    this.category = category;
    this.dataSource = dataSource;
    this.listElement = listElement;
    this.searchQuery = searchQuery;
    this.currentSort = "name-asc";
    this.products = [];
    this.cart = new ShoppingCart("so-cart", null);
  }

  sortProducts(products, sortOption = this.currentSort) {
    const items = Array.isArray(products) ? [...products] : [];

    switch (sortOption) {
      case "name-desc":
        return items.sort((a, b) =>
          this.productName(b).localeCompare(this.productName(a)),
        );
      case "price-asc":
        return items.sort(
          (a, b) => this.productPrice(a) - this.productPrice(b),
        );
      case "price-desc":
        return items.sort(
          (a, b) => this.productPrice(b) - this.productPrice(a),
        );
      case "name-asc":
      default:
        return items.sort((a, b) =>
          this.productName(a).localeCompare(this.productName(b)),
        );
    }
  }

  productName(product) {
    return product.title || product.NameWithoutBrand || product.Name || "";
  }

  productPrice(product) {
    return Number(product.price ?? product.FinalPrice ?? 0);
  }

  bindSortControl() {
    const sortControl = document.querySelector("#product-sort");
    if (!sortControl) return;

    sortControl.value = this.currentSort;
    sortControl.onchange = (event) => {
      this.currentSort = event.target.value;
      this.renderList(this.products);
    };
  }

  bindAddToCart() {
    this.listElement?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-add-to-cart]");
      if (!button) return;

      const product = this.products.find(
        (item) => String(item.id ?? item.Id) === button.dataset.productId,
      );
      if (!product) return;

      this.cart.addItem(product);
      button.textContent = "Added";
      window.setTimeout(() => {
        button.textContent = "Add to cart";
      }, 1200);
    });
  }

  // Fetches product data and renders the page title and product list.
  async init() {
    const list = this.searchQuery
      ? await this.dataSource.searchProducts(this.searchQuery)
      : await this.dataSource.getData(this.category);
    this.products = Array.isArray(list) ? list : [];
    this.bindSortControl();
    this.bindAddToCart();
    this.renderList(this.products);

    const title = document.querySelector(".products h2");
    if (title) {
      if (this.searchQuery) {
        title.textContent = `Search Results: ${this.searchQuery}`;
      } else {
        const formattedCategory = this.category
          ? this.category.charAt(0).toUpperCase() + this.category.slice(1)
          : "Products";
        title.textContent = `Top Products: ${formattedCategory}`;
      }
    }
  }

  // Renders the products returned by the API, while still linking known product pages when available.
  renderList(list = this.products) {
    const products = this.sortProducts(list, this.currentSort);
    renderListWithTemplate(
      (product) => productCardTemplate(product, this.category || "tents"),
      this.listElement,
      products,
      "afterbegin",
      true,
    );
  }
}