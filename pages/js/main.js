/**
 * main site controller
 * @fileoverview handles assets, loading, init
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

/**
 * @typedef {Object} FetchOptions
 * @property {RequestCache} [cacheMode='no-store']
 * @property {number} [timeoutMs=8000]
 * @property {boolean} [useMemoryCache=true]
 * @property {number} [retryCount=0]
 */

// constants
const CONSTANTS = Object.freeze({
	DEFAULT_TIMEOUT: 8000,
	DEFAULT_SKELETON_COUNT: 4,
	FTP_SKELETON_COUNT: 2,
	CACHE_MODE: 'no-store',
	DEFAULT_SITE_TITLE: 'neuros.click',
	DEFAULT_SITE_DESCRIPTION:
		'A collection of sites created or maintained by Superbox for the Neuro-sama Community',
	DEFAULT_CTA: { label: 'Neuro Discord', href: 'https://discord.com/invite/neurosama' },
	ELEMENT_IDS: {
		PAGE_TITLE: 'page-title',
		PAGE_DESC: 'page-desc',
		PRIMARY_CTA: 'primary-cta',
		FOOTER: 'foot',
		GRID: 'grid',
		CLIENT_EXPANDERS: 'client-expanders',
	},
})

// app state
const AppState = {
	_cache: new Map(),
	_pendingRequests: new Map(),
	initialized: false,
	errors: [],
}

// paths relative to current page. dont ask
const DATA_PATH = document.location.pathname.includes('/neuro-') ? '../data/' : './data/'

/**
 * fetch with retry & dedup
 * @template T
 * @param {string} url - url to fetch
 * @param {FetchOptions} [opts] - options
 * @returns {Promise<T|null>}
 */
export async function fetchJSON(url, opts = {}) {
	const {
		cacheMode = CONSTANTS.CACHE_MODE,
		timeoutMs = CONSTANTS.DEFAULT_TIMEOUT,
		useMemoryCache = true,
		retryCount = 0,
	} = opts

	// already cached gets returned
	if (useMemoryCache && AppState._cache.has(url)) {
		return /** @type {T} */ (AppState._cache.get(url))
	}

	// fetch pending = wait for it
	if (AppState._pendingRequests.has(url)) {
		return AppState._pendingRequests.get(url)
	}

	const fetchPromise = _performFetch(url, {
		cacheMode,
		timeoutMs,
		useMemoryCache,
		retryCount,
	})
	AppState._pendingRequests.set(url, fetchPromise)

	try {
		const result = await fetchPromise
		return result
	} finally {
		AppState._pendingRequests.delete(url)
	}
}

/**
 * actual fetch with retries
 * @template T
 * @param {string} url
 * @param {FetchOptions} opts
 * @returns {Promise<T|null>}
 * @private
 */
async function _performFetch(url, opts) {
	const { cacheMode, timeoutMs, useMemoryCache, retryCount } = opts
	let lastError = null

	for (let attempt = 0; attempt <= retryCount; attempt++) {
		const ctrl = new AbortController()
		const timeoutId = setTimeout(() => ctrl.abort(), timeoutMs)

		try {
			const res = await fetch(url, {
				cache: cacheMode,
				signal: ctrl.signal,
				headers: {
					Accept: 'application/json',
					'Cache-Control': cacheMode === 'no-store' ? 'no-cache' : 'default',
				},
			})

			if (!res.ok) {
				throw new Error(`HTTP ${res.status}: ${res.statusText} for ${url}`)
			}

			const contentType = res.headers.get('content-type')
			if (!contentType?.includes('application/json')) {
				throw new Error(`Invalid content type: ${contentType || 'unknown'} for ${url}`)
			}

			const data = /** @type {T} */ (await res.json())

			if (useMemoryCache && data !== null) {
				AppState._cache.set(url, data)
			}

			return data
		} catch (err) {
			lastError = err
			clearTimeout(timeoutId)

			// don't retry aborts or 404s
			if (err.name === 'AbortError' || err.message.includes('HTTP 404')) {
				break
			}

			// exponential backoff
			if (attempt < retryCount) {
				const delay = Math.min(1000 * Math.pow(2, attempt), 5000)
				await new Promise((resolve) => setTimeout(resolve, delay))
			}
		} finally {
			clearTimeout(timeoutId)
		}
	}

	// log failures (except timeouts)
	if (lastError && lastError.name !== 'AbortError') {
		console.warn(`Failed to fetch JSON from ${url} after ${retryCount + 1} attempts.`, {
			error: lastError.message,
			attempts: retryCount + 1,
			url,
		})
	}

	return null
}

/**
 * data fetchers with fallbacks
 */

/**
 * @returns {Promise<Site>}
 */
export async function getSiteConfig() {
	const fallback = /** @type {Site} */ ({
		title: CONSTANTS.DEFAULT_SITE_TITLE,
		description: CONSTANTS.DEFAULT_SITE_DESCRIPTION,
		cta: { label: 'Open', href: '#' },
	})

	try {
		const data = await fetchJSON(`${DATA_PATH}site.json`, { retryCount: 1 })
		return _validateSiteConfig(data) ? data : fallback
	} catch (error) {
		console.warn('Failed to load site config, using fallback', error)
		return fallback
	}
}

/**
 * @returns {Promise<{ pages: Page[] }>}
 */
export async function getPages() {
	const fallback = {
		pages: [
			{
				name: 'Content Loading',
				description: 'Please wait while we load the available pages...',
				image: '',
				href: '#',
			},
		],
	}

	try {
		const data = await fetchJSON(`${DATA_PATH}pages.json`, { retryCount: 1 })
		return _validatePagesData(data) ? data : fallback
	} catch (error) {
		console.warn('Failed to load pages data, using fallback', error)
		return fallback
	}
}

/**
 * @returns {Promise<{ clients: Client[] }|null>}
 */
export async function getFtpClients() {
	try {
		const data = await fetchJSON(`${DATA_PATH}neuro-ftp-clients.json`, { retryCount: 1 })
		return _validateClientsData(data) ? data : null
	} catch (error) {
		console.warn('Failed to load FTP clients data', error)
		return null
	}
}

/**
 * validation helpers
 */

/**
 * @param {any} data
 * @returns {data is Site}
 * @private
 */
function _validateSiteConfig(data) {
	return (
		data &&
		typeof data === 'object' &&
		(typeof data.title === 'string' || data.title === undefined) &&
		(typeof data.description === 'string' || data.description === undefined)
	)
}

/**
 * @param {any} data
 * @returns {data is { pages: Page[] }}
 * @private
 */
function _validatePagesData(data) {
	return (
		data &&
		typeof data === 'object' &&
		Array.isArray(data.pages) &&
		data.pages.every(
			(page) => page && typeof page === 'object' && typeof page.name === 'string'
		)
	)
}

/**
 * @param {any} data
 * @returns {data is { clients: Client[] }}
 * @private
 */
function _validateClientsData(data) {
	return (
		data &&
		typeof data === 'object' &&
		Array.isArray(data.clients) &&
		data.clients.every(
			(client) =>
				client &&
				typeof client === 'object' &&
				typeof client.id === 'string' &&
				typeof client.name === 'string'
		)
	)
}

/**
 * cache utils
 */
export function clearMemoryCache() {
	AppState._cache.clear()
	// console.debug('Memory cache cleared')
}

/**
 * @param {string[]} [urls] - specific urls or all
 */
export function invalidateCache(urls) {
	if (urls) {
		urls.forEach((url) => AppState._cache.delete(url))
		// console.debug(`Cache invalidated for ${urls.length} URLs`)
	} else {
		clearMemoryCache()
	}
}

/**
 * @returns {number}
 */
export function getCacheSize() {
	return AppState._cache.size
}

/**
 * dom helpers - only update if needed
 */

/**
 * @param {HTMLElement|null} el
 * @param {string} text
 */
export function setTextIf(el, text) {
	if (!el || typeof text !== 'string') return

	if (el.textContent !== text) {
		el.textContent = text
	}
}

/**
 * get element by id
 * @template {HTMLElement} T
 * @param {string} id
 * @returns {T|null}
 */
export function getElementById(id) {
	if (!id || typeof id !== 'string') return null
	return /** @type {T|null} */ (document.getElementById(id))
}

/**
 * set attrs if different
 * @param {HTMLElement|null} el
 * @param {Record<string, string>} attrs
 */
export function setAttributesIf(el, attrs) {
	if (!el || !attrs || typeof attrs !== 'object') return

	// batch updates
	Object.entries(attrs).forEach(([key, value]) => {
		if (typeof key === 'string' && typeof value === 'string') {
			if (el.getAttribute(key) !== value) {
				el.setAttribute(key, value)
			}
		}
	})
}

/**
 * toggle hidden if changed
 * @param {HTMLElement|null} el
 * @param {boolean} hidden
 */
export function setHidden(el, hidden) {
	if (!el || typeof hidden !== 'boolean') return

	if (el.hidden !== hidden) {
		el.hidden = hidden
	}
}

/**
 * @returns {DocumentFragment}
 */
export function createFragment() {
	return document.createDocumentFragment()
}

/**
 * safe query selector
 * @param {string} selector
 * @param {ParentNode} [parent=document]
 * @returns {HTMLElement|null}
 */
export function querySelector(selector, parent = document) {
	try {
		if (!selector || typeof selector !== 'string') return null
		return /** @type {HTMLElement|null} */ (parent.querySelector(selector))
	} catch (error) {
		console.warn(`Invalid selector: ${selector}`, error)
		return null
	}
}

/**
 * create element with attrs & text
 * @param {string} tagName
 * @param {Record<string, string>} [attributes]
 * @param {string} [textContent]
 * @returns {HTMLElement}
 */
export function createElement(tagName, attributes, textContent) {
	const element = document.createElement(tagName)

	if (attributes) {
		setAttributesIf(element, attributes)
	}

	if (textContent) {
		setTextIf(element, textContent)
	}

	return element
}

/**
 * skeleton cards for loading
 * @param {number} count - how many
 * @returns {DocumentFragment}
 */
export function createSkeletonCards(count) {
	// validate
	const validCount = Math.max(0, Math.floor(Number(count) || 0))
	if (validCount === 0) {
		console.warn('Invalid count provided to createSkeletonCards:', count)
		return createFragment()
	}

	const fragment = createFragment()

	// reusable structure
	const createSkeletonCard = () => {
		const card = createElement('div', { class: 'card skeleton' })
		const thumb = createElement('div', { class: 'thumb' })
		const body = createElement('div', { class: 'body' })
		const title = createElement('div', { class: 'title' })
		const desc = createElement('div', { class: 'desc' })

		body.appendChild(title)
		body.appendChild(desc)
		card.appendChild(thumb)
		card.appendChild(body)

		return card
	}

	// batch create
	for (let i = 0; i < validCount; i++) {
		fragment.appendChild(createSkeletonCard())
	}

	return fragment
}

/**
 * error state element
 * @param {string} message - error msg
 * @param {string} [actionText] - button text
 * @param {Function} [onAction] - callback
 * @returns {HTMLElement}
 */
export function createErrorState(message, actionText, onAction) {
	const errorDiv = createElement('div', { class: 'error-state' })
	const messageEl = createElement('p', {}, message)
	errorDiv.appendChild(messageEl)

	if (actionText && onAction) {
		const actionBtn = createElement('button', { class: 'error-action' }, actionText)
		actionBtn.addEventListener('click', onAction, { once: true })
		errorDiv.appendChild(actionBtn)
	}

	return errorDiv
}

/**
 * site config appliers
 */

/**
 * apply title with fallback
 * @param {Site} siteConfig
 * @param {string} [titleId]
 */
export function applySiteTitle(siteConfig, titleId = CONSTANTS.ELEMENT_IDS.PAGE_TITLE) {
	try {
		const titleEl = getElementById(titleId)
		const title = siteConfig?.title || CONSTANTS.DEFAULT_SITE_TITLE
		setTextIf(titleEl, title)

		// update doc title too
		if (title && title !== document.title) {
			document.title = title
		}
	} catch (error) {
		console.warn(`Failed to apply site title: ${error.message}`)
	}
}

/**
 * apply description if empty
 * @param {Site} siteConfig
 * @param {string} [descId]
 */
export function applySiteDescription(
	siteConfig,
	descId = CONSTANTS.ELEMENT_IDS.PAGE_DESC
) {
	try {
		const descEl = getElementById(descId)
		if (!descEl) return

		const currentContent = descEl.textContent?.trim() || ''
		const shouldUpdate =
			currentContent.length === 0 ||
			currentContent.includes('placeholder') ||
			currentContent.includes('loading')

		if (shouldUpdate && siteConfig?.description) {
			setTextIf(descEl, siteConfig.description)
		}
	} catch (error) {
		console.warn(`Failed to apply site description: ${error.message}`)
	}
}

/**
 * apply cta, validate & fallback if needed
 * @param {Site} siteConfig
 * @param {string} [ctaId]
 */
export function applySiteCta(siteConfig, ctaId = CONSTANTS.ELEMENT_IDS.PRIMARY_CTA) {
	try {
		const ctaEl = getElementById(ctaId)
		if (!ctaEl) {
			// console.warn(`CTA element not found: ${ctaId}`)
			return
		}

		// validate cta
		const cta = siteConfig?.cta
		const isValidCta =
			cta?.href &&
			cta?.label &&
			typeof cta.href === 'string' &&
			typeof cta.label === 'string'

		if (isValidCta) {
			ctaEl.textContent = cta.label
			ctaEl.href = cta.href

			// external link security
			if (cta.href.startsWith('http')) {
				setAttributesIf(ctaEl, {
					rel: 'noopener noreferrer',
					target: '_blank',
				})
			}
		} else {
			// fallback cta
			ctaEl.textContent = CONSTANTS.DEFAULT_CTA.label
			ctaEl.href = CONSTANTS.DEFAULT_CTA.href
			setAttributesIf(ctaEl, {
				rel: 'noopener noreferrer',
				target: '_blank',
			})
		}

		setHidden(ctaEl, false)
	} catch (error) {
		// console.warn(`Failed to apply site CTA: ${error.message}`)
	}
}

/**
 * apply all site config
 * @param {Site} siteConfig
 */
export function applySiteConfiguration(siteConfig) {
	if (!siteConfig || typeof siteConfig !== 'object') {
		console.warn('Invalid site configuration provided')
		return
	}

	const operations = [
		() => applySiteTitle(siteConfig),
		() => applySiteDescription(siteConfig),
		() => applySiteCta(siteConfig),
	]

	const errors = []

	operations.forEach((operation, index) => {
		try {
			operation()
		} catch (error) {
			errors.push({ operation: index, error })
		}
	})

	if (errors.length > 0) {
		console.warn('Errors occurred while applying site configuration:', errors)
		// partial ok
	}
}

/**
 * footer with year update
 * @param {Site} siteConfig
 * @param {string} [footerId]
 */
export function initFooter(siteConfig, footerId = CONSTANTS.ELEMENT_IDS.FOOTER) {
	try {
		const footerEl = getElementById(footerId)
		if (!footerEl) {
			console.warn(`Footer element not found: ${footerId}`)
			return
		}

		const currentYear = new Date().getFullYear()
		let footerText = ''

		if (siteConfig?.footer && typeof siteConfig.footer === 'string') {
			footerText = siteConfig.footer
				.replace(/©\s*\d{4}/, `© ${currentYear}`)
				.replace(/^(?!©)/, `© ${currentYear} `)
		} else {
			footerText = `© ${currentYear}`
		}

		setTextIf(footerEl, footerText)
	} catch (error) {
		console.warn(`Failed to initialize footer: ${error.message}`)
	}
}

/**
 * grab theme script
 */
import { initThemeControl } from './theme.js'

/**
 * init theme
 * @returns {Promise<void>}
 */
async function initializeTheme() {
	try {
		initThemeControl()
		// console.debug('Theme control initialized successfully')
	} catch (error) {
		console.warn('Theme control initialization failed, using system defaults:', error)
	}
}

/**
 * site config setup
 * @returns {Promise<Site>}
 */
async function initializeSiteConfig() {
	try {
		const siteConfig = await getSiteConfig()
		applySiteConfiguration(siteConfig)
		initFooter(siteConfig)
		// console.debug('Site configuration applied successfully')
		return siteConfig
	} catch (error) {
		console.error('Critical error in site configuration:', error)

		const fallbackConfig = {
			title: CONSTANTS.DEFAULT_SITE_TITLE,
			description: CONSTANTS.DEFAULT_SITE_DESCRIPTION,
			cta: CONSTANTS.DEFAULT_CTA,
		}

		try {
			applySiteConfiguration(fallbackConfig)
			initFooter(fallbackConfig)
			return fallbackConfig
		} catch (fallbackError) {
			throw new Error(`Site configuration completely failed: ${fallbackError.message}`)
		}
	}
}

/**
 * page cards init with recovery
 * @returns {Promise<void>}
 */
async function initializePageCards() {
	const gridContainer = getElementById(CONSTANTS.ELEMENT_IDS.GRID)
	if (!gridContainer) {
		console.warn('Grid container not found, skipping page cards initialization')
		return
	}

	// show loading
	gridContainer.innerHTML = ''
	gridContainer.appendChild(createSkeletonCards(CONSTANTS.DEFAULT_SKELETON_COUNT))
	gridContainer.classList.add('loading')

	try {
		const pageData = await getPages()
		gridContainer.classList.remove('loading')

		const { renderCards } = await import('./cards.js')
		renderCards(gridContainer, pageData.pages || [])

		// console.debug('Page cards initialized successfully')
	} catch (error) {
		gridContainer.classList.remove('loading')

		// retry if error
		const errorEl = createErrorState(
			'Failed to load content. This might be a temporary issue.',
			'Retry',
			() => initializePageCards()
		)

		gridContainer.innerHTML = ''
		gridContainer.appendChild(errorEl)

		console.warn('Page cards initialization failed:', error)
	}
}

/**
 * ftp page drop down card expanders
 * @returns {Promise<void>}
 */
async function initializeFtpExpanders() {
	// Only run expander initialization on neuro-ftp page
	if (!document.location.pathname.includes('/neuro-ftp')) {
		return
	}

	const expanderHost = getElementById(CONSTANTS.ELEMENT_IDS.CLIENT_EXPANDERS)
	if (!expanderHost) {
		return // no host found, skip initialization
	}

	try {
		// skeletons to hold space then fill w/ data
		expanderHost.innerHTML = ''
		expanderHost.appendChild(createSkeletonCards(CONSTANTS.FTP_SKELETON_COUNT))

		const ftpData = await getFtpClients()
		const clients = ftpData?.clients || []

		const { mountExpanders } = await import('./expander.js')
		mountExpanders(expanderHost, clients)

		// console.debug(`FTP expanders initialized with ${clients.length} clients`)
	} catch (error) {
		expanderHost.innerHTML =
			'<div class="info-state">FTP client information temporarily unavailable</div>'
		console.warn('FTP expanders initialization failed:', error)
	}
}

/**
 * initialize whole application
 * @returns {Promise<void>}
 */
export async function initializeApplication() {
	if (AppState.initialized) {
		console.warn('application already initialized')
		return
	}

	const startTime = performance.now()
	const criticalErrors = []

	// console.debug('Starting application initialization...')

	// required otherwise it's over
	const criticalTasks = [{ name: 'Site Configuration', task: initializeSiteConfig }]

	// not very important -> not great not terrible
	const nonCriticalTasks = [
		{ name: 'Theme Control', task: initializeTheme },
		{ name: 'Page Cards', task: initializePageCards },
		{ name: 'FTP Expanders', task: initializeFtpExpanders },
	]

	// important tasks -> sequentially
	for (const { name, task } of criticalTasks) {
		try {
			await task()
		} catch (error) {
			criticalErrors.push({ name, error })
		}
	}

	// async pog
	const nonCriticalPromises = nonCriticalTasks.map(async ({ name, task }) => {
		try {
			await task()
			return { name, success: true }
		} catch (error) {
			console.warn(`Non-critical initialization failed for ${name}:`, error)
			return { name, success: false, error }
		}
	})

	const nonCriticalResults = await Promise.allSettled(nonCriticalPromises)

	// bsod
	if (criticalErrors.length > 0) {
		const errorMessage = `Critical initialization failed: ${criticalErrors
			.map((e) => e.name)
			.join(', ')}`
		console.error(errorMessage, criticalErrors)
		AppState.errors = criticalErrors
		throw new Error(errorMessage)
	}

	// logging init
	const duration = Math.round(performance.now() - startTime)
	const successful = nonCriticalResults.filter(
		(r) => r.status === 'fulfilled' && r.value.success
	).length
	const total = nonCriticalResults.length

	console.log(`Application initialized in ${duration}ms (${successful}/${total} modules successful)`)
	AppState.initialized = true
}

/**
 * bootstrap & error messaging
 * @returns {Promise<void>}
 */
async function bootstrap() {
	try {
		await initializeApplication()
		// console.debug('Application bootstrap completed successfully')
	} catch (error) {
		console.error('Application bootstrap failed:', error)

		// user error banner
		const body = document.body
		if (body) {
			const existingError = querySelector('.bootstrap-error')
			if (!existingError) {
				const errorBanner = createElement(
					'div',
					{
						class: 'bootstrap-error',
						style:
							'position: fixed; top: 0; left: 0; right: 0; background: #ff6b6b; color: white; padding: 1rem; text-align: center; z-index: 9999;',
					},
					'Site initialization failed. Please refresh the page or try again later.'
				)

				body.insertBefore(errorBanner, body.firstChild)
			}
		}

		throw error
	}
}

// dom status check
function initializeWhenReady() {
	try {
		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', bootstrap, { once: true })
		} else {
			// avoid blocking
			setTimeout(bootstrap, 0)
		}
	} catch (error) {
		console.error('Failed to setup application initialization:', error)
		// if stuck try after delay
		setTimeout(bootstrap, 1000)
	}
}

// start
initializeWhenReady()
