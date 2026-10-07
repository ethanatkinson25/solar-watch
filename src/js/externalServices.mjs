const configuredBaseURL = import.meta.env.VITE_SERVER_URL;
if (!configuredBaseURL) {
  throw new Error("VITE_SERVER_URL must be configured before making API requests.");
}

const baseURL = new URL(`${configuredBaseURL.replace(/\/+$/, "")}/`);

function apiURL(path) {
  return new URL(path, baseURL);
}

// Parses JSON responses and reports HTTP or malformed-response errors with useful context.
export async function convertToJson(res) {
  const responseText = await res.text();
  let jsonResponse;

  if (responseText) {
    try {
      jsonResponse = JSON.parse(responseText);
    } catch {
      if (!res.ok) {
        throw new Error(`Request failed with HTTP ${res.status} ${res.statusText}.`);
      }

      throw new Error(`Expected a JSON response, but received invalid JSON (HTTP ${res.status}).`);
    }
  }

  if (res.ok) {
    if (!responseText) {
      throw new Error(`Expected a JSON response, but received an empty response (HTTP ${res.status}).`);
    }

    return jsonResponse;
  }

  const detail = jsonResponse?.message ?? jsonResponse;
  const message = detail
    ? typeof detail === "string"
      ? detail
      : JSON.stringify(detail)
    : res.statusText;
  throw new Error(`Request failed with HTTP ${res.status}${message ? `: ${message}` : "."}`);
}

export default class ExternalServices {
  // Stores the product category used for fetching product data.
  constructor(category) {
    this.category = category;
  }

  // Fetches product data for a category from the backend API.
  async getData(category = this.category) {
    if (!category) return [];
    const response = await fetch(apiURL(`products/search/${category}`));
    const data = await convertToJson(response);
    return data.Result || data;
  }

  // Searches the API for products matching a user-entered term.
  async searchProducts(searchTerm) {
    const trimmedTerm = (searchTerm || "").trim();
    if (!trimmedTerm) return [];

    const response = await fetch(
      apiURL(`products/search/${encodeURIComponent(trimmedTerm)}`),
    );
    const data = await convertToJson(response);
    return data.Result || data;
  }

  // Fetches a single product by its unique ID.
  async findProductById(id) {
    const response = await fetch(apiURL(`product/${id}`));
    const data = await convertToJson(response);
    return data.Result || data;
  }

  // Submits a completed order to the backend checkout endpoint.
  async checkout(payload) {
    const response = await fetch(apiURL("checkout"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return convertToJson(response);
  }
}
