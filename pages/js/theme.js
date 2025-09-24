/**
 * theme read/write and toggle functions
 * @module theme.js
 */

import { getElementById, setTextIf } from "./main.js"

const STORAGE_KEY = "theme"
const THEME_AUTO = "auto"
const THEME_LIGHT = "light"
const THEME_DARK = "dark"

/**
 * @returns {'light'|'dark'}
 */
function getSystemTheme() {
	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light"
}

/**
 * gets theme from localStorage or defaults to auto
 * @returns {'auto'|'light'|'dark'}
 */
export function getTheme() {
	const saved = localStorage.getItem(STORAGE_KEY)
	if (saved === THEME_AUTO || saved === THEME_LIGHT || saved === THEME_DARK)
		return saved
	return THEME_AUTO
}

/**
 * sets theme & persists to localStorage
 * @param {'auto'|'light'|'dark'} theme
 */
export function setTheme(theme) {
	try {
		const html = document.documentElement
		if (theme === THEME_AUTO) {
			html.setAttribute("data-theme", getSystemTheme())
		} else {
			html.setAttribute("data-theme", theme)
		}
		localStorage.setItem(STORAGE_KEY, theme)
	} catch (error) {
		console.error("Failed to set theme:", error)
	}
}

/**
 * Updates theme button text
 * @param {HTMLElement|null} btn
 * @private
 */
function _updateThemeButtonUI(btn) {
	if (!btn) return
	const currentTheme = getTheme()
	setTextIf(btn, `Theme: ${currentTheme}`)
}

/**
 * set up button to toggle themes
 * @param {{ buttonId?: string }} [opts]
 */
export function initThemeControl(opts = {}) {
	try {
		const { buttonId = "theme-btn" } = opts
		const btn = getElementById(buttonId)

		// Set initial theme and update button text
		setTheme(getTheme())
		_updateThemeButtonUI(btn)

		if (btn) {
			btn.addEventListener("click", () => {
				const current = getTheme()
				const next =
					current === THEME_DARK
						? THEME_LIGHT
						: current === THEME_LIGHT
							? THEME_AUTO
							: THEME_DARK
				setTheme(next)
				_updateThemeButtonUI(btn)
			})
		}

		// Listen for system preference changes
		window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
			if (getTheme() === THEME_AUTO) {
				const newSystemTheme = e.matches ? "dark" : "light"
				document.documentElement.setAttribute("data-theme", newSystemTheme)
			}
		})
	} catch (error) {
		console.error("Failed to initialize theme control:", error)
	}
}