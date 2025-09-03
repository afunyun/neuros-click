/**
 * Extracted data functionality from original app.js
 * This is meant to be imported by other .js modules only, it does not stand on its own.
 *
 * Types (JSDoc):
 * @typedef {{ label: string, href: string }} CTA
 * @typedef {{ title?: string, description?: string, cta?: CTA, footer?: string }} Site
 * @typedef {{ name: string, description?: string, image?: string, href?: string }} Page
 * @typedef {{
 *   id: string,
 *   name: string,
 *   icon?: string,
 *   short?: string,
 *   instructions?: string,
 *   downloadUrl: string,
 *   importHref?: string,
 *   importLabel?: string
 * }} Client
 */

const _cache = new Map();

/**
 * Fetch JSON with optional timeout and in-memory caching.
 * @template T
 * @param {string} url
 * @param {{ cacheMode?: RequestCache, timeoutMs?: number, useMemoryCache?: boolean }} [opts]
 * @returns {Promise<T|null>} resolves to parsed JSON or null on failure
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
    console.warn(`Could not load ${url}:`, err);
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
    description: 'json file thing done maybe',
    cta: { label: 'Open', href: '#' },
    footer: '© bwaa',
  });
  const data = await fetchJSON('/assets/json/site.json');
  return data ?? fallback;
}

/**
 * @returns {Promise<{ pages: Page[] }>}
 */
export async function getPages() {
  const fallback = { pages: [
    { name: 'Placeholder', description: 'If you see this it means the pages.json is not loaded', image: '', href: '#' },
  ]};
  const data = await fetchJSON('/assets/json/pages.json');
  return data ?? fallback;
}

/**
 * @returns {Promise<{ clients: Client[] }|null>}
 */
export async function getFtpClients() {
  return fetchJSON('/assets/json/neuro-ftp-clients.json');
}

/**
 * In-memory clearing.
 */
export function clearMemoryCache() {
  _cache.clear();
}
