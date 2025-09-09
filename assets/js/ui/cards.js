/**
 * @typedef {import('../types.js').Page} Page
 */

import { resolveAssetPath } from "../data.js";

/**
 * @param {HTMLElement|null} container
 * @param {Page[]} items
 */
export function renderCards(container, items) {
	if (!container) {
		console.warn("Cannot render cards: container element not found");
		return;
	}

	if (!Array.isArray(items)) {
		console.warn("Cannot render cards: items is not an array");
		return;
	}

	try {
		container.innerHTML = "";
		const frag = document.createDocumentFragment();

		for (const item of items) {
			const a = document.createElement("a");
			a.href =
				typeof item.href === "string" && item.href.length ? item.href : "#";
			a.className = "card stretch";
			a.setAttribute("role", "listitem");

			const thumb = document.createElement("div");
			thumb.className = "thumb";
			if (item.image) {
				const img = document.createElement("img");
				img.src = resolveAssetPath(item.image);
				img.alt = "";
				img.decoding = "async";
				img.loading = "lazy";
				img.width = 120;
				img.height = 120;

				img.addEventListener("load", () => {
					img.style.opacity = "1";
				});

				img.addEventListener("error", () => {
					img.style.opacity = "0.5";
					img.alt = "Image failed to load";
				});

				if (item.hoverImage) {
					const originalSrc = resolveAssetPath(item.image);
					const hoverSrc = resolveAssetPath(item.hoverImage);

					a.addEventListener("mouseenter", () => {
						img.src = hoverSrc;
					});

					a.addEventListener("mouseleave", () => {
						img.src = originalSrc;
					});
				}

				thumb.appendChild(img);
			} else {
				const span = document.createElement("span");
				span.textContent = "image";
				thumb.appendChild(span);
			}

			const body = document.createElement("div");
			body.className = "body";

			const title = document.createElement("div");
			title.className = "title";
			title.textContent = item.name ?? "Untitled";

			const desc = document.createElement("div");
			desc.className = "desc";
			desc.textContent = item.description ?? "";

			body.appendChild(title);
			body.appendChild(desc);

			a.appendChild(thumb);
			a.appendChild(body);

			frag.appendChild(a);
		}

		container.appendChild(frag);
	} catch (error) {
		console.error("Failed to render cards:", error);
		container.innerHTML =
			'<div class="card"><div class="body"><div class="title">Error loading content</div><div class="desc">Please refresh the page to try again.</div></div></div>';
		throw error;
	}
}
