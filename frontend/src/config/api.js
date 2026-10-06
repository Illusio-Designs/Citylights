// Single place that decides which backend the frontend talks to.
//
// - VITE_API_URL wins when set.
// - In a production build a localhost value is ignored (it can only be a mistake
//   there), so the live API is used instead.
// - In `vite dev` a localhost value is honoured, so local testing no longer
//   silently reads and writes production data.
const LIVE_API_URL = "https://api.viveralighting.com/api";

const isLocalUrl = (url) => /localhost|127\.0\.0\.1/i.test(url);

const clean = (value) => (typeof value === "string" ? value.trim().replace(/\/+$/, "") : "");

export const API_URL = (() => {
  const envUrl = clean(import.meta.env.VITE_API_URL);
  if (envUrl && (import.meta.env.DEV || !isLocalUrl(envUrl))) return envUrl;
  return LIVE_API_URL;
})();

// Base URL for static files (uploads), i.e. the API URL without the /api suffix.
export const FILES_BASE_URL = (() => {
  const imageUrl = clean(import.meta.env.VITE_IMAGE_URL);
  if (imageUrl && (import.meta.env.DEV || !isLocalUrl(imageUrl))) return imageUrl;
  return API_URL.replace(/\/api$/, "");
})();
