import { initThemeControl } from './ui/theme.js';
import { getSiteConfig, getPages, getFtpClients } from './data.js';
import { renderCards } from './ui/cards.js';
import { mountExpanders } from './ui/expander.js';

function setTextIf(el, text) {
  if (!el) return;
  el.textContent = text;
}

/**
 * Sets up the site application. Does a lot.
 * 
 * - Enables and applies the theme swapping button.
 * - Applies the config for buttons etc.
 * - Sets up the footer because couldn't find anywhere else to put it.
 * - Renders page cards the json data.
 * - Mounts FTP client expanders if applicable.
 * 
 * @async
 * @function bootstrap
 * @returns {Promise<void>} Finishes when init is done.
 * @throws {Error} If any of the async operations fail, this throws.
 */
async function bootstrap() {
  initThemeControl();

  const site = await getSiteConfig();
  const titleEl = document.getElementById('page-title');
  setTextIf(titleEl, site.title ?? 'neuros.click');

  const descEl = document.getElementById('page-desc');
  if (descEl && descEl.textContent.trim().length === 0) {
    setTextIf(descEl, site.description ?? '');
  }

  const cta = document.getElementById('primary-cta');
  if (cta) {
    if (site?.cta?.href && site?.cta?.label) {
      cta.textContent = site.cta.label;
      cta.href = site.cta.href;
      cta.hidden = false;
    } else {
      cta.textContent = 'neurocord';
      cta.href = 'https://discord.com/invite/neurosama';
      cta.hidden = false;
    }
  }

  const currentYear = new Date().getFullYear();
  const footerText = site.footer ? site.footer.replace('©', `© ${currentYear}`) : `© ${currentYear} bwaa`;
  const footEl = document.getElementById('foot');
  setTextIf(footEl, footerText);

  const pageData = await getPages();
  renderCards(document.getElementById('grid'), pageData.pages || []);

  const expanderHost = document.getElementById('client-expanders');
  if (expanderHost) {
    const clients = (await getFtpClients())?.clients || [];
    mountExpanders(expanderHost, clients);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
