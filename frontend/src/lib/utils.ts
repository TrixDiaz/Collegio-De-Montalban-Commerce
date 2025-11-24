import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Backend base URL for serving static files
// Use environment variable or default to production URL
const getBackendBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl) {
    // Remove /api/v1 if present to get base URL
    return envUrl.replace(/\/api\/v1\/?$/, '');
  }
  // Default to production backend URL
  return 'https://tile-depot-backend-production.up.railway.app';
};

const BACKEND_BASE_URL = getBackendBaseUrl();

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility function to get full image URL from backend
export function getImageUrl(imagePath: string) {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;

  // Normalize path separators - database stores paths like "uploads/products/thumbnail-..."
  const normalizedPath = imagePath.replace(/\\/g, '/');

  // The backend serves static files from /uploads, so we need to remove the "uploads/" prefix
  // if it exists, since the backend route is already "/uploads"
  let cleanPath = normalizedPath;
  if (normalizedPath.startsWith('/uploads/')) {
    cleanPath = normalizedPath.substring(9); // Remove "/uploads/" prefix
  } else if (normalizedPath.startsWith('uploads/')) {
    cleanPath = normalizedPath.substring(8); // Remove "uploads/" prefix
  }

  return `${BACKEND_BASE_URL}/uploads/${cleanPath}`;
}
