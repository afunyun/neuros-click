/**
 * Extracted theme functionality from original app.js.
 */

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
  const html = document.documentElement;
  if (theme === THEME_AUTO) {
    html.setAttribute('data-theme', getSystemTheme());
  } else {
    html.setAttribute('data-theme', theme);
  }
  localStorage.setItem(STORAGE_KEY, theme);
}

/**
 * Initialize theme controller and bind toggle button if present.
 * @param {{ buttonId?: string }} [opts]
 */
export function initThemeControl(opts = {}) {
  const { buttonId = 'theme-btn' } = opts;
  const btn = document.getElementById(buttonId);

  // initial apply
  const current = getTheme();
  setTheme(current);
  if (btn) btn.textContent = `Theme: ${current}`;

  // button toggle
  if (btn) {
    btn.addEventListener('click', () => {
      const cur = getTheme();
      const next = cur === THEME_DARK ? THEME_LIGHT : cur === THEME_LIGHT ? THEME_AUTO : THEME_DARK;
      setTheme(next);
      btn.textContent = `Theme: ${next}`;
    });
  }

  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener('change', (e) => {
    if (getTheme() === THEME_AUTO) {
      document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    }
  });
}
