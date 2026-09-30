const baseURL = import.meta.env.VITE_SERVER_URL;
const checkoutURL = `${baseURL}checkout`;

// Converts a fetch response into JSON and throws a structured error with the server payload when the request fails.
export async function convertToJson(res) {
  const jsonResponse = await res.json();

  if (res.ok) {
    return jsonResponse;
  } else {
    throw { name: "servicesError", message: jsonResponse };
  }
}

export default class ExternalServices {
  // Stores the product category used for fetching product data.
  constructor(category) {
    this.category = category;
  }

  // Fetches product data for a category from the backend API.
  async getData(category = this.category) {
    if (!category) return [];
    const response = await fetch(`${baseURL}products/search/${category}`);
    const data = await convertToJson(response);
    return data.Result || data;
  }

  // Searches the API for products matching a user-entered term.
  async searchProducts(searchTerm) {
    const trimmedTerm = (searchTerm || "").trim();
    if (!trimmedTerm) return [];

    const response = await fetch(
      `${baseURL}products/search/${encodeURIComponent(trimmedTerm)}`,
    );
    const data = await convertToJson(response);
    return data.Result || data;
  }

  // Fetches a single product by its unique ID.
  async findProductById(id) {
    const response = await fetch(`${baseURL}product/${id}`);
    const data = await convertToJson(response);
    return data.Result || data;
  }

  // Submits a completed order to the backend checkout endpoint.
  async checkout(payload) {
    const response = await fetch(checkoutURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return convertToJson(response);
  }
}
