// Convert a string into a URL-friendly slug.
// e.g. "VLC 101 Precision COB Recessed LED Downlight"
//   -> "vlc-101-precision-cob-recessed-led-downlight"
export const slugify = (text = "") =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-") // non-alphanumerics -> hyphen
    .replace(/^-+|-+$/g, ""); // trim leading/trailing hyphens

// Prefer an explicit slug stored on the product, fall back to a
// slug generated from the product name.
export const productSlug = (product = {}) =>
  product.slug && product.slug.trim()
    ? product.slug.trim()
    : slugify(product.name);

export default slugify;
