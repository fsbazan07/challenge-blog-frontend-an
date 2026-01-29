import { environment } from '../../../../environments/environment';

const ASSETS_URL = environment.assetsUrl ?? 'http://localhost:3000';

export function resolveCover(url: string | null | undefined) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${ASSETS_URL}${url}`;
}
