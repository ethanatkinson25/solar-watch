export default class ImageList {
  constructor(center, date_created, description, keywords, media_type, nasa_id, title) {
    this.center = center;
    this.date_created = date_created;
    this.description = description;
    this.keywords = keywords;
    this.media_type = media_type;
    this.nasa_id = nasa_id;
    this.title = title;
  }

  toString() {
    return `Image: ${this.title} (${this.nasa_id})`;
  }

  // Ensures the NASA metadata fields are ready for this image record.
  async init() {
    this.center ??= "";
    this.date_created ??= "";
    this.description ??= "";
    this.keywords = Array.isArray(this.keywords) ? this.keywords : [];
    this.media_type ??= "image";
    this.nasa_id ??= "";
    this.title ??= "Untitled image";

    return this;
  }
}