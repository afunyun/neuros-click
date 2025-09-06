/**
 * Basically the loader. reduces the bloat in index.js 
 */

import { initThemeControl } from '../ui/theme.js';
import { getSiteConfig, getPages, getFtpClients } from '../data.js';
import { applySiteConfiguration } from './site-config.js';
import { initFooter } from '../ui/footer.js';
import { renderCards } from '../ui/cards.js';
import { mountExpanders } from '../ui/expander.js';
import { getElementById } from '../utils/dom.js';

async function initializeTheme() {
  try {
    initThemeControl();
  } catch (error) {
    console.warn('Failed to initialize theme control:', error);
    throw new Error('Theme initialization failed');
  }
}

async function initializeSiteConfig() {
  try {
    const siteConfig = await getSiteConfig();
    applySiteConfiguration(siteConfig);
    initFooter(siteConfig);
    return siteConfig;
  } catch (error) {
    console.warn('Failed to initialize site configuration:', error);
    throw new Error('Site configuration initialization failed');
  }
}

async function initializePageCards() {
  const gridContainer = getElementById('grid');
  if (!gridContainer) {
    return;
  }

  try {
    const pageData = await getPages();
    renderCards(gridContainer, pageData.pages || []);
  } catch (error) {
    console.warn('Failed to initialize page cards:', error);
    throw new Error('Page cards initialization failed');
  }
}

async function initializeFtpExpanders() {
  const expanderHost = getElementById('client-expanders');
  if (!expanderHost) {
    return;
  }

  try {
    const ftpData = await getFtpClients();
    const clients = (ftpData && typeof ftpData === 'object' && Array.isArray(ftpData.clients))
      ? ftpData.clients
      : [];
    mountExpanders(expanderHost, clients);
  } catch (error) {
    console.warn('Failed to initialize FTP expanders:', error);
    throw new Error('FTP expanders are not available');
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
    console.warn('Non-critical error:', error);
  }

  try {
    await initializeFtpExpanders();
  } catch (error) {
    console.warn('Non-critical error:', error);
  }

  if (errors.length > 0) {
    const errorMessage = `Someone tell Superbox there's a ${errors.length} with his  ̶A̶I̶ site`;
    console.error(errorMessage, errors);
    throw new Error(errorMessage);
  }
}