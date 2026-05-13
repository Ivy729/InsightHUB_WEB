import { API_BASE_URL } from '../apiConfig';

/**
 * Returns a usable image URL for sidebar/header avatars, or null for initials fallback.
 * @param {{ avatarPath?: string, profilePhoto?: string } | null | undefined} user
 */
export function resolveUserAvatarSrc(user) {
  if (!user) return null;

  const path = String(user.avatarPath || '').trim();
  if (path) {
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const normalized = path.startsWith('/') ? path : `/${path}`;
    return `${API_BASE_URL}${normalized}`;
  }

  const photo = String(user.profilePhoto || '').trim();
  if (!photo) return null;
  if (photo.startsWith('data:') || photo.startsWith('http://') || photo.startsWith('https://')) {
    return photo;
  }
  if (photo.startsWith('/')) {
    return `${API_BASE_URL}${photo}`;
  }
  return photo;
}
