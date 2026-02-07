// API Configuration
// Uses environment variable in production, localhost in development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// GCS bucket for file uploads (images). Set VITE_STORAGE_BUCKET in .env
export const STORAGE_BUCKET = import.meta.env.VITE_STORAGE_BUCKET || 'restaurant-files-001';

/** Use for img src: if url is a path (e.g. dishes/foo.jpg), request it from the backend API so it works on Firebase Hosting. */
export function getImageSrc(url) {
    if (!url || typeof url !== 'string') return url;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return API_URL + '/api/image/' + encodeURIComponent(url);
}

export default API_URL;
