// API Configuration
// Uses environment variable in production, localhost in development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// GCS bucket for file uploads (images). Set VITE_STORAGE_BUCKET in .env
export const STORAGE_BUCKET = import.meta.env.VITE_STORAGE_BUCKET || 'restaurant-files-001';

export default API_URL;
