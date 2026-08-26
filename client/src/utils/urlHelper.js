/**
 * Helper to resolve media URLs (screenshots, profile pictures, note attachments)
 * If the URL is relative (e.g. /uploads/image.png), prepends the backend server base URL.
 */
export const getMediaUrl = (url) => {
  if (!url) return '';
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:') ||
    url.startsWith('blob:')
  ) {
    return url;
  }

  // Get backend host from VITE_SOCKET_URL or fallback
  const backendBase = (import.meta.env.VITE_SOCKET_URL || 'https://peervo.onrender.com').replace(/\/+$/, '');
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${backendBase}${cleanPath}`;
};
