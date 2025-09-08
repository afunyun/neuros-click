/**
 * currently very simple obviously but if we want to add more to the footer at some point this is it.
 * prevents bootstrap from handling it since it was 80 entire lines of bloat.
 *
 * @typedef {import('../types.js').Site} Site
 */

import { setTextIf, getElementById } from '../utils/dom.js';

/**
 * @param {Site} siteConfig
 * @param {string} [footerId='foot']
 */
export function initFooter(siteConfig, footerId = 'foot') {
  const footerEl = getElementById(footerId);
  if (!footerEl) return;

  const currentYear = new Date().getFullYear();
  const footerText = siteConfig.footer
    ? siteConfig.footer.replace('©', `© ${currentYear}`)
    : `© ${currentYear}`;

  setTextIf(footerEl, footerText);
}