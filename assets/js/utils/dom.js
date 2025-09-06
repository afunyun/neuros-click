/**
 * script for all dom manipulations to live in one place.
 */

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