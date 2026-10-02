import { loadHeaderFooter } from './utilis.mjs';
import ImageList from './imageList.mjs';

loadHeaderFooter();

const listElement = document.querySelector("#image-list");

// Initializes the gallery by fetching images from the NASA API and populating the image list
async function initGallery() {
  if (!listElement) return;

  const response = await fetch(
    "https://images-api.nasa.gov/search?q=nebula&media_type=image",
  );
  if (!response.ok) {
    throw new Error(`Unable to load images (${response.status})`);
  }

  const result = await response.json();
  const items = result.collection?.items ?? [];

  // Map the fetched items to ImageList instances and initialize them
  const images = await Promise.all(items.map(async (item) => {
    const data = item.data?.[0];
    if (!data) return null;

    const image = new ImageList(
      data.center,
      data.date_created,
      data.description,
      data.keywords,
      data.media_type,
      data.nasa_id,
      data.title,
    );
    await image.init();

    return { image, url: item.links?.[0]?.href };
  }));

  // Filter out any null entries resulting from failed image initialization
  // and only include images that have a valid URL
  images.filter((entry) => entry?.url).forEach(({ image, url }) => {
    const listItem = document.createElement("li");
    listItem.className = "gallery-card";

    const thumbnail = document.createElement("img");
    thumbnail.src = url;
    thumbnail.alt = image.title;
    thumbnail.loading = "lazy";

    const title = document.createElement("h2");
    title.textContent = image.title;

    const description = document.createElement("p");
    description.textContent = image.description;

    listItem.append(thumbnail, title, description);
    listElement.append(listItem);
  });
}

// Handles gallery errors
initGallery().catch((error) => {
  console.error("Failed to load images:", error);
  if (listElement) {
    listElement.textContent = "Images could not be loaded.";
  }
});

