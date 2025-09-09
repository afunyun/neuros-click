/**
 * Shared types.
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

export {};
