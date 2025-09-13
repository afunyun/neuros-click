/**
 * Main application bootstrap and initialization
 * Consolidates app-controller, site-config, data fetching, and DOM utilities
 */

/**
 * @typedef {Object} CTA
 * @property {string} label
 * @property {string} href
 */

/**
 * @typedef {Object} Site
 * @property {string=} title
 * @property {string=} description
 * @property {CTA=} cta
 * @property {string=} footer
 */

/**
 * @typedef {Object} Page
 * @property {string} name
 * @property {string=} description
 * @property {string=} image
 * @property {string=} hoverImage
 * @property {string=} href
 */

/**
 * @typedef {Object} Client
 * @property {string} id
 * @property {string} name
 * @property {string=} icon
 * @property {string=} short
 * @property {string=} instructions
 * @property {string|null} downloadUrl
 * @property {string=} importHref
 * @property {string=} importLabel
 */

const _cache = new Map();

/**
 * Get the base path for asset resolution
 * @returns {string}
 */
export function getBasePath() {
	const pathname = window.location.pathname;
	const segments = pathname.replace(/\/$/, "").split("/").filter(Boolean);

	if (window.location.hostname.includes("github.io")) {
		if (segments[0] === "neuros-click") {
			return "/neuros-click/";
		}
	}

	if (segments.length <= 1) {
		return "./";
	}

	const depth = segments.length - 1;
	return "../".repeat(depth);
}

/**
 * Uses base path to resolve relative asset paths
 * @param {string} path
 * @returns {string}
 */
export function resolveAssetPath(path) {
	if (!path || typeof path !== "string") return path;

	if (path.startsWith("http") || path.startsWith("//")) return path;

	if (path.startsWith("./")) {
		return path.replace("./", getBasePath());
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
	const {
		cacheMode = "no-store",
		timeoutMs = 8000,
		useMemoryCache = true,
	} = opts;

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
		console.warn(
			`Could not load JSON from ${url}. Please ensure the file exists as valid json.`,
			err,
		);
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
		title: "neuros.click",
		description:
			"A collection of sites created or maintained by Superbox for the Neuro-sama Community",
		cta: { label: "Open", href: "#" },
	});
	const basePath = getBasePath();
	const data = await fetchJSON(`${basePath}data/site.json`);
	return data ?? fallback;
}

/**
 * @returns {Promise<{ pages: Page[] }>}
 */
export async function getPages() {
	const fallback = {
		pages: [
			{
				name: "Placeholder",
				description: "If you see this it means the pages.json is not loaded",
				image: "",
				href: "#",
			},
		],
	};
	const basePath = getBasePath();
	const data = await fetchJSON(`${basePath}data/pages.json`);
	return data ?? fallback;
}

/**
 * @returns {Promise<{ clients: Client[] }|null>}
 */
export async function getFtpClients() {
	const basePath = getBasePath();
	return fetchJSON(`${basePath}data/neuro-ftp-clients.json`);
}

export function clearMemoryCache() {
	_cache.clear();
}

/**
 * @param {HTMLElement|null} el
 * @param {string} text
 */
export function setTextIf(el, text) {
	if (!el) return;
	el.textContent = text;
}

/**
 * @template {HTMLElement} T
 * @param {string} id
 * @returns {T|null}
 */
export function getElementById(id) {
	return /** @type {T|null} */ (document.getElementById(id));
}

/**
 * @param {HTMLElement|null} el
 * @param {Record<string, string>} attrs
 */
export function setAttributesIf(el, attrs) {
	if (!el) return;
	for (const [key, value] of Object.entries(attrs)) {
		el.setAttribute(key, value);
	}
}

/**
 * @param {HTMLElement|null} el
 * @param {boolean} hidden
 */
export function setHidden(el, hidden) {
	if (!el) return;
	el.hidden = hidden;
}

/**
 * @returns {DocumentFragment}
 */
export function createFragment() {
	return document.createDocumentFragment();
}

/**
 * @param {Site} siteConfig
 * @param {string} [titleId='page-title']
 */
export function applySiteTitle(siteConfig, titleId = "page-title") {
	const titleEl = getElementById(titleId);
	setTextIf(titleEl, siteConfig.title ?? "neuros.click");
}

/**
 * @param {Site} siteConfig
 * @param {string} [descId='page-desc']
 */
export function applySiteDescription(siteConfig, descId = "page-desc") {
	const descEl = getElementById(descId);
	if (descEl && descEl.textContent.trim().length === 0) {
		setTextIf(descEl, siteConfig.description ?? "");
	}
}

/**
 * @param {Site} siteConfig
 * @param {string} [ctaId='primary-cta']
 */
export function applySiteCta(siteConfig, ctaId = "primary-cta") {
	const ctaEl = getElementById(ctaId);
	if (!ctaEl) return;

	if (siteConfig?.cta?.href && siteConfig?.cta?.label) {
		ctaEl.textContent = siteConfig.cta.label;
		ctaEl.href = siteConfig.cta.href;
		setHidden(ctaEl, false);
	} else {
		ctaEl.textContent = "Neuro Discord";
		ctaEl.href = "https://discord.com/invite/neurosama";
		setHidden(ctaEl, false);
	}
}

/**
 * @param {Site} siteConfig
 */
export function applySiteConfiguration(siteConfig) {
	try {
		applySiteTitle(siteConfig);
		applySiteDescription(siteConfig);
		applySiteCta(siteConfig);
	} catch (error) {
		console.warn("Error applying site configuration:", error);
		throw error;
	}
}

/**
 * @param {Site} siteConfig
 * @param {string} [footerId='foot']
 */
export function initFooter(siteConfig, footerId = "foot") {
	const footerEl = getElementById(footerId);
	if (!footerEl) return;

	const currentYear = new Date().getFullYear();
	const footerText = siteConfig.footer
		? siteConfig.footer.replace("©", `© ${currentYear}`)
		: `© ${currentYear}`;

	setTextIf(footerEl, footerText);
}

import { renderCards } from "./cards.js";
import { mountExpanders } from "./expander.js";
import { initThemeControl } from "./theme.js";

async function initializeTheme() {
	try {
		initThemeControl();
	} catch (error) {
		console.warn("Failed to initialize theme control:", error);
		throw new Error("Theme initialization failed");
	}
}

async function initializeSiteConfig() {
	try {
		const siteConfig = await getSiteConfig();
		applySiteConfiguration(siteConfig);
		initFooter(siteConfig);
		return siteConfig;
	} catch (error) {
		console.warn("Failed to initialize site configuration:", error);
		throw new Error("Site configuration initialization failed");
	}
}

async function initializePageCards() {
	const gridContainer = getElementById("grid");
	if (!gridContainer) {
		return;
	}

	gridContainer.innerHTML =
		'<div class="loading-spinner" style="margin: 20px auto;"></div>';
	gridContainer.classList.add("loading");

	try {
		const pageData = await getPages();
		gridContainer.classList.remove("loading");
		renderCards(gridContainer, pageData.pages || []);
	} catch (error) {
		gridContainer.classList.remove("loading");
		gridContainer.innerHTML =
			'<div class="error-state">Failed to load content. Please refresh the page to try again.</div>';
		console.warn("Failed to initialize page cards:", error);
		throw new Error("Page cards initialization failed");
	}
}

async function initializeFtpExpanders() {
	const expanderHost = getElementById("client-expanders");
	if (!expanderHost) {
		return;
	}

	try {
		const ftpData = await getFtpClients();
		const clients =
			ftpData && typeof ftpData === "object" && Array.isArray(ftpData.clients)
				? ftpData.clients
				: [];
		mountExpanders(expanderHost, clients);
	} catch (error) {
		console.warn("Failed to initialize FTP expanders:", error);
		throw new Error("FTP expanders are not available");
	}
}

/**
 * @returns {Promise<void>}
 */
export async function initializeApplication() {
	const errors = [];

	try {
		await initializeTheme();
	} catch (error) {
		errors.push(error);
	}

	try {
		await initializeSiteConfig();
	} catch (error) {
		errors.push(error);
	}

	try {
		await initializePageCards();
	} catch (error) {
		console.warn("Non-critical error:", error);
	}

	try {
		await initializeFtpExpanders();
	} catch (error) {
		console.warn("Non-critical error:", error);
	}

	if (errors.length > 0) {
		const errorMessage = `Someone tell Superbox there's a ${errors.length} with his  ̶A̶I̶ site`;
		console.error(errorMessage, errors);
		throw new Error(errorMessage);
	}
}

/**
 * @async
 * @function bootstrap
 * @returns {Promise<void>}
 * @throws {Error}
 */
async function bootstrap() {
	try {
		await initializeApplication();
	} catch (error) {
		console.error("Application failed to initialize:", error);
		throw error;
	}
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", bootstrap);
} else {
	bootstrap();
}
