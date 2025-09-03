/**
 * Cards rendering.
 * @typedef {{ name: string, description?: string, image?: string, href?: string }} Page
 */

/**
 * Render card links in container.
 * @param {HTMLElement|null} container
 * @param {Page[]} items
 */
export function renderCards(container, items) {
  if (!container) return;
  container.innerHTML = '';
  const frag = document.createDocumentFragment();

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

    frag.appendChild(a);
  }

  container.appendChild(frag);
}
