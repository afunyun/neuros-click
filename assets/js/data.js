/**
 * @file data.js
 * @typedef {import('./types.js').CTA} CTA
 * @typedef {import('./types.js').Site} Site
 * @typedef {import('./types.js').Page} Page
 * @typedef {import('./types.js').Client} Client
 */

const _cache = new Map();

/**
 * Get the base path for asset resolution
 * @returns {string}
 */
export function getBasePath() {
  const pathname = window.location.pathname;
  const segments = pathname.replace(/\/$/, '').split('/').filter(Boolean);

  // GitHub Pages specifically has the worst url resolution ever. can be removed on real domain
  if (window.location.hostname.includes('github.io')) {
    if (segments[0] === 'neuros-click') {
      return '/neuros-click/';
    }
  }

  if (segments.length <= 1) {
    return './';
  }

  const depth = segments.length - 1;
  return '../'.repeat(depth);
}

/**
 * Uses base path to resolve relative asset paths
 * @param {string} path
 * @returns {string}
 */
export function resolveAssetPath(path) {
  if (!path || typeof path !== 'string') return path;

  if (path.startsWith('http') || path.startsWith('//')) return path;

  if (path.startsWith('./')) {
    return path.replace('./', getBasePath());
  }

  return path;
}

/**
 * @template T
 * @param {string} url
 * @param {{ cacheMode?: RequestCache, timeoutMs?: number, useMemoryCache?: boolean }} [opts]
 * @returns {Promise<T|null>}
 */
export async function fetchJSON(url, opts = {}) {
  const { cacheMode = 'no-store', timeoutMs = 8000, useMemoryCache = true } = opts;

  if (useMemoryCache && _cache.has(url)) {
    return /** @type {T} */ (_cache.get(url));
  }

  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { cache: cacheMode, signal: ctrl.signal });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const data = /** @type {T} */ (await res.json());
    if (useMemoryCache) _cache.set(url, data);
    return data;
  } catch (err) {
    console.warn(`Could not load JSON from ${url}. Please ensure the file exists as valid json.`, err);
    return null;
  } finally {
    clearTimeout(to);
  }
}

/**
 * @returns {Promise<Site>}
 */
export async function getSiteConfig() {
  const fallback = /** @type {Site} */ ({
    title: 'neuros.click',
    description: 'A collection of sites created or maintained by Superbox for the Neuro-sama Community',
    cta: { label: 'Open', href: '#' },
  });
  const basePath = getBasePath();
  const data = await fetchJSON(`${basePath}assets/json/site.json`);
  return data ?? fallback;
}

/**
 * @returns {Promise<{ pages: Page[] }>}
 */
export async function getPages() {
  const fallback = {
    pages: [
      { name: 'Placeholder', description: 'If you see this it means the pages.json is not loaded', image: '', href: '#' },
    ]
  };
  const basePath = getBasePath();
  const data = await fetchJSON(`${basePath}assets/json/pages.json`);
  return data ?? fallback;
}

/**
 * @returns {Promise<{ clients: Client[] }|null>}
 */
export async function getFtpClients() {
  const basePath = getBasePath();
  return fetchJSON(`${basePath}assets/json/neuro-ftp-clients.json`);
}

export function clearMemoryCache() {
  _cache.clear();
}
