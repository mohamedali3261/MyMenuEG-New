export const resolveAssetUrl = (value?: string | null): string => {
  const raw = (value || '').trim();
  if (!raw) return '';
  const origin = (import.meta as any).env?.VITE_ASSET_ORIGIN || (import.meta as any).env?.VITE_API_ORIGIN || '';

  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;

  // Absolute path from API (e.g. /uploads/...)
  if (raw.startsWith('/')) {
    return origin ? `${String(origin).replace(/\/$/, '')}${raw}` : raw;
  }

  // Bare filename or relative key -> /uploads/<key>
  const path = `/uploads/${raw}`;
  return origin ? `${String(origin).replace(/\/$/, '')}${path}` : path;
};
