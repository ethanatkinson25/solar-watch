import ProductList from './productList.mjs';
import { loadHeaderFooter } from './utilis.mjs';

loadHeaderFooter();

const listElement = document.querySelector('.product-list');

// Calls Fake Store API to fetch products and initializes the product list component
const productList = new ProductList(
  "products",
  {
    async getData() {
      const response = await fetch("https://fakestoreapi.com/products");
      if (!response.ok) {
        throw new Error(`Unable to load products (${response.status})`);
      }
      return response.json();
    },
  },
  listElement,
);

// Initializes the product list and handle errors
productList.init().catch((error) => {
  console.error("Failed to load products:", error);
  if (listElement) {
    listElement.innerHTML = "<li>Products could not be loaded.</li>";
  }
});