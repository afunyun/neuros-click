(function themeControl() {
  const html = document.documentElement;
  const btn = document.getElementById('theme-btn');
  const saved = localStorage.getItem('theme');
  if (saved === 'light' || saved === 'dark') html.setAttribute('data-theme', saved);
  btn.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : current === 'light' ? 'auto' : 'dark';
    if (next === 'auto') html.setAttribute('data-theme', 'auto');
    else html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    btn.textContent = next === 'auto' ? 'Theme: auto' : `Theme: ${next}`;
  });
  btn.textContent = (saved ?? 'auto') === 'auto' ? 'Theme: auto' : `Theme: ${saved}`;
})();

async function loadJSON(path) {
  try {
    const res = await fetch(path, { cache: 'no-store' });
    if (!res.ok) throw new Error(res.status + ' ' + res.statusText);
    return await res.json();
  } catch (err) {
    console.warn(`Could not load ${path}:`, err);
    return null;
  }
}

function renderCards(items) {
  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  for (const item of items) {
    const a = document.createElement('a');
    a.href = typeof item.href === 'string' && item.href.length ? item.href : '#';
    a.className = 'card stretch';
    a.setAttribute('role', 'listitem');

    const thumb = document.createElement('div');
    thumb.className = 'thumb';
    if (item.image) {
      const img = document.createElement('img');
      img.src = item.image;
      img.alt = '';
      img.decoding = 'async';
      img.loading = 'lazy';
      thumb.appendChild(img);
    } else {
      const span = document.createElement('span');
      span.textContent = 'image';
      thumb.appendChild(span);
    }

    const body = document.createElement('div');
    body.className = 'body';

    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = item.name ?? 'Untitled';

    const desc = document.createElement('div');
    desc.className = 'desc';
    desc.textContent = item.description ?? '';

    body.appendChild(title);
    body.appendChild(desc);

    a.appendChild(thumb);
    a.appendChild(body);

    grid.appendChild(a);
  }
}

(async function bootstrap() {
  const site = (await loadJSON('data/site.json')) || {
    title: 'neuros.click',
    description: 'json file thing done maybe',
    cta: { label: 'Open', href: '#' },
    footer: '© ' + new Date().getFullYear() + ' bwaa',
  };
  document.getElementById('page-title').textContent = site.title ?? 'neuros.click';
  document.getElementById('page-desc').textContent = site.description ?? '';
  const cta = document.getElementById('primary-cta');
  if (cta) {
    cta.textContent = 'neurocord';
    cta.href = 'https://discord.com/invite/neurosama';
    cta.hidden = false;
  }
  document.getElementById('foot').textContent = site.footer ?? '';

  const data = (await loadJSON('data/pages.json')) || {
    pages: [
      { name: 'Example Page', description: 'Add description here', image: '', href: '#' },
      { name: 'add page', description: 'cust', image: '', href: '#' },
      { name: 'thru', description: 'json', image: '', href: '#' },
    ],
  };
  renderCards(data.pages || []);
})();
