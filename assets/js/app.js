(function themeControl() {
  const html = document.documentElement;
  const btn = document.getElementById('theme-btn');

  function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    if (theme === 'auto') {
      html.setAttribute('data-theme', getSystemTheme());
    } else {
      html.setAttribute('data-theme', theme);
    }
    localStorage.setItem('theme', theme);
    btn.textContent = `Theme: ${theme}`;
  }

  const savedTheme = localStorage.getItem('theme') || 'auto';
  applyTheme(savedTheme);

  btn.addEventListener('click', () => {
    const currentTheme = localStorage.getItem('theme') || 'auto';
    const next = currentTheme === 'dark' ? 'light' : currentTheme === 'light' ? 'auto' : 'dark';
    applyTheme(next);
  });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (localStorage.getItem('theme') === 'auto') {
      html.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    }
  });
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
  if (!grid) return; // added for ftp page since this card function is also used for that right now.
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
  const site = (await loadJSON('assets/json/site.json')) || {
    title: 'neuros.click',
    description: 'json file thing done maybe',
    cta: { label: 'Open', href: '#' },
    footer: '© bwaa',
  };
  const titleEl = document.getElementById('page-title');
  if (titleEl) titleEl.textContent = site.title ?? 'neuros.click';
  const descEl = document.getElementById('page-desc');
  if (descEl && descEl.textContent.trim().length === 0) {
    descEl.textContent = site.description ?? '';
  }
  const cta = document.getElementById('primary-cta');
  if (cta) {
    cta.textContent = 'neurocord';
    cta.href = 'https://discord.com/invite/neurosama';
    cta.hidden = false;
  }
  
  const currentYear = new Date().getFullYear();
  const footerText = site.footer ? site.footer.replace('©', `© ${currentYear}`) : `© ${currentYear} bwaa`;
  document.getElementById('foot').textContent = footerText;

  const pageData = (await loadJSON('assets/json/pages.json')) || {
    pages: [
      { name: 'Placeholder', description: 'If you see this is means the pages.json is not loaded', image: '', href: '#' },
    ],
  };
  renderCards(pageData.pages || []);

  const expanderHost = document.getElementById('client-expanders');
  if (expanderHost) {
    const clients = (await loadJSON('assets/json/neuro-ftp-clients.json')).clients;

    function renderExpanders() {
      expanderHost.innerHTML = '';
      clients.forEach((c) => {
        const container = document.createElement('div');
        container.className = 'expander';
        container.dataset.id = c.id;

        const head = document.createElement('button');
  head.className = 'btn primary expander-btn';
        head.type = 'button';
        head.setAttribute('aria-expanded', 'false');
  head.innerHTML = `<span class="expander-thumb" aria-hidden="true"><img src="${c.icon}" alt="" loading="lazy" decoding="async" /></span><span class="expander-title">${c.name}</span>`;

  const panel = document.createElement('div');
  panel.className = 'expander-panel card';
        panel.hidden = true;

        const body = document.createElement('div');
        body.className = 'body';

        const title = document.createElement('div');
        title.className = 'title';
        title.textContent = c.name;

        const desc = document.createElement('div');
        desc.className = 'desc';
        desc.textContent = c.short;

        const list = document.createElement('div');
        list.className = 'instructions';
        list.innerHTML = c.instructions
          .split('\n')
          .filter(Boolean)
          .map((line) => `<div class="step">${line}</div>`) 
          .join('');

        const actions = document.createElement('div');
        actions.className = 'actions';
        const dl = document.createElement('a');
        dl.className = 'btn primary';
        dl.href = c.downloadUrl;
        dl.target = '_blank';
        dl.rel = 'noopener noreferrer';
        dl.textContent = `Get ${c.name}`;

        actions.appendChild(dl);
        if (c.importHref) {
          const importBtn = document.createElement('a');
          importBtn.className = 'btn neutral';
          importBtn.href = c.importHref;
          importBtn.download = '';
          importBtn.textContent = c.importLabel;
          actions.appendChild(importBtn);
        } else {
          const note = document.createElement('div');
          note.className = 'hint';
          note.textContent = 'Import available soon.';
          actions.appendChild(note);
        }

        body.appendChild(title);
        body.appendChild(desc);
        body.appendChild(list);
        body.appendChild(actions);

  panel.appendChild(body);

        container.appendChild(head);
        container.appendChild(panel);

        head.addEventListener('click', () => {
          const expanded = head.getAttribute('aria-expanded') === 'true';
          head.setAttribute('aria-expanded', expanded ? 'false' : 'true');
          panel.hidden = expanded;
          container.classList.toggle('expanded', !expanded);
        });

        expanderHost.appendChild(container);
      });
    }

    renderExpanders();
  }
})();
