const STORAGE_KEY = 'theme';
const THEME_AUTO = 'auto';
const THEME_LIGHT = 'light';
const THEME_DARK = 'dark';

/**
 * @returns {'light'|'dark'}
 */
function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * @returns {'auto'|'light'|'dark'}
 */
export function getTheme() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === THEME_AUTO || saved === THEME_LIGHT || saved === THEME_DARK) return saved;
  return THEME_AUTO;
}

/**
 * @param {'auto'|'light'|'dark'} theme
 */
export function setTheme(theme) {
  try {
    const html = document.documentElement;
    if (theme === THEME_AUTO) {
      html.setAttribute('data-theme', getSystemTheme());
    } else {
      html.setAttribute('data-theme', theme);
    }
    localStorage.setItem(STORAGE_KEY, theme);
  } catch (error) {
    console.error('Failed to set theme:', error);
    throw error;
  }
}

import { getElementById, setTextIf } from '../utils/dom.js';

/**
 * @param {{ buttonId?: string }} [opts]
 */
export function initThemeControl(opts = {}) {
  try {
    const { buttonId = 'theme-btn' } = opts;
    const btn = getElementById(buttonId);

    const current = getTheme();
    setTheme(current);
    setTextIf(btn, `Theme: ${current}`);

    if (btn) {
      btn.addEventListener('click', () => {
        try {
          const cur = getTheme();
          const next = cur === THEME_DARK ? THEME_LIGHT : cur === THEME_LIGHT ? THEME_AUTO : THEME_DARK;
          setTheme(next);
          setTextIf(btn, `Theme: ${next}`);
        } catch (error) {
          console.error('Failed to change theme:', error);
        }
      });
    }

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', (e) => {
      try {
        if (getTheme() === THEME_AUTO) {
          document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        }
      } catch (error) {
        console.error('Failed to handle system theme change:', error);
      }
    });
  } catch (error) {
    console.error('Failed to initialize theme control:', error);
    throw error;
  }
}
