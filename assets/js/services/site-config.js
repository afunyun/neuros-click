/**
 * Init site config & apply to DOM without enormous monolith
 *
 * @typedef {import('../types.js').Site} Site
 */

import { setTextIf, getElementById, setHidden } from '../utils/dom.js';

/**
 * @param {Site} siteConfig
 * @param {string} [titleId='page-title']
 */
export function applySiteTitle(siteConfig, titleId = 'page-title') {
  const titleEl = getElementById(titleId);
  setTextIf(titleEl, siteConfig.title ?? 'neuros.click');
}

/**
 * @param {Site} siteConfig
 * @param {string} [descId='page-desc']
 */
export function applySiteDescription(siteConfig, descId = 'page-desc') {
  const descEl = getElementById(descId);
  if (descEl && descEl.textContent.trim().length === 0) {
    setTextIf(descEl, siteConfig.description ?? '');
  }
}

/**
 * @param {Site} siteConfig
 * @param {string} [ctaId='primary-cta']
 */
export function applySiteCta(siteConfig, ctaId = 'primary-cta') {
  const ctaEl = getElementById(ctaId);
  if (!ctaEl) return;

  if (siteConfig?.cta?.href && siteConfig?.cta?.label) {
    ctaEl.textContent = siteConfig.cta.label;
    ctaEl.href = siteConfig.cta.href;
    setHidden(ctaEl, false);
  } else {
    ctaEl.textContent = 'Neuro Discord';
    ctaEl.href = 'https://discord.com/invite/neurosama';
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
    console.warn('Error applying site configuration:', error);
    throw error;
  }
}