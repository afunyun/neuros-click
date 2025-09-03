/**
 * @typedef {import('../types.js').Client} Client
 */

function renderInstructions(listEl, instructions) {
  listEl.innerHTML = '';
  const frag = document.createDocumentFragment();
  (instructions || '')
    .split('\n')
    .filter(Boolean)
    .forEach((line) => {
      const div = document.createElement('div');
      div.className = 'step';
      div.textContent = line;
      frag.appendChild(div);
    });
  listEl.appendChild(frag);
}

/**
 * Mounts expander list into host w/ 1 click handler.
 * @param {HTMLElement|null} host
 * @param {Client[]} clients
 */
export function mountExpanders(host, clients) {
  if (!host || !Array.isArray(clients)) return;
  host.innerHTML = '';
  const frag = document.createDocumentFragment();
  clients.forEach((c) => {
    const container = document.createElement('div');
    container.className = 'expander';
    container.dataset.id = c.id;

    const head = document.createElement('button');
    head.className = 'btn primary expander-btn';
    head.type = 'button';
    head.setAttribute('aria-expanded', 'false');

    const thumb = document.createElement('span');
    thumb.className = 'expander-thumb';
    thumb.setAttribute('aria-hidden', 'true');
    const img = document.createElement('img');
    img.src = c.icon || '';
    img.alt = '';
    img.loading = 'lazy';
    img.decoding = 'async';
    thumb.appendChild(img);
    const title = document.createElement('span');
    title.className = 'expander-title';
    title.textContent = c.name;
    head.appendChild(thumb);
    head.appendChild(title);

    const panel = document.createElement('div');
    panel.className = 'expander-panel card';
    panel.hidden = true;

    const body = document.createElement('div');
    body.className = 'body';

    const t = document.createElement('div');
    t.className = 'title';
    t.textContent = c.name;
    const d = document.createElement('div');
    d.className = 'desc';
    d.textContent = c.short || '';

    const list = document.createElement('div');
    list.className = 'instructions';
    renderInstructions(list, c.instructions || '');

    const actions = document.createElement('div');
    actions.className = 'actions';
    const dl = document.createElement('a');
    dl.className = 'btn primary';
    dl.href = c.downloadUrl || '#';
    dl.target = '_blank';
    dl.rel = 'noopener noreferrer';
    dl.textContent = `Get ${c.name}`;
    actions.appendChild(dl);
    if (c.importHref) {
      const importBtn = document.createElement('a');
      importBtn.className = 'btn neutral';
      importBtn.href = c.importHref;
      importBtn.download = '';
      importBtn.textContent = c.importLabel || 'Import';
      actions.appendChild(importBtn);
    } else {
      const note = document.createElement('div');
      note.className = 'hint';
      note.textContent = 'Import available soon.';
      actions.appendChild(note);
    }

    body.appendChild(t);
    body.appendChild(d);
    body.appendChild(list);
    body.appendChild(actions);
    panel.appendChild(body);

    container.appendChild(head);
    container.appendChild(panel);

    frag.appendChild(container);
  });
  host.appendChild(frag);

  if (!host.dataset.expanderDelegated) {
    host.addEventListener('click', (e) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      const head = target.closest('button.expander-btn');
      if (!head || !host.contains(head)) return;
      const container = head.closest('.expander');
      const panel = container?.querySelector('.expander-panel');
      if (!panel) return;
      const expanded = head.getAttribute('aria-expanded') === 'true';
      head.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      panel.hidden = expanded;
      container.classList.toggle('expanded', !expanded);
    });
    host.dataset.expanderDelegated = '1';
  }
}
