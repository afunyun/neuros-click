/**
 * @typedef {import('../types.js').Client} Client
 */

import { resolveAssetPath } from "../data.js";

function renderInstructions(listEl, instructions) {
	listEl.innerHTML = "";
	const frag = document.createDocumentFragment();
	(instructions || "")
		.split("\n")
		.filter(Boolean)
		.forEach((line) => {
			const div = document.createElement("div");
			div.className = "step";
			div.textContent = line;
			frag.appendChild(div);
		});
	listEl.appendChild(frag);
}

/**
 * @param {HTMLElement|null} host
 * @param {Client[]} clients
 */
export function mountExpanders(host, clients) {
	if (!host) {
		console.warn("Cannot mount expanders: no host element");
		return;
	}

	if (!Array.isArray(clients)) {
		console.warn("Cannot mount expanders: clients should be an array");
		return;
	}

	try {
		host.innerHTML = "";
		const fragment = document.createDocumentFragment();

		clients.forEach((client) => {
			const expanderContainer = document.createElement("div");
			expanderContainer.className = "expander";
			expanderContainer.dataset.id = client.id;

			const cardHeader = document.createElement("div");
			cardHeader.className = "card expander-head";
			cardHeader.setAttribute("role", "button");
			cardHeader.setAttribute("tabindex", "0");
			cardHeader.setAttribute("aria-expanded", "false");

			const logoThumb = document.createElement("div");
			logoThumb.className = "thumb";
			const logoImg = document.createElement("img");
			logoImg.src = resolveAssetPath(client.icon || "");
			logoImg.alt = "";
			logoImg.loading = "lazy";
			logoImg.decoding = "async";
			logoThumb.appendChild(logoImg);

			const cardBody = document.createElement("div");
			cardBody.className = "body";

			const cardTitle = document.createElement("div");
			cardTitle.className = "title";
			cardTitle.textContent = client.name;

			const cardDesc = document.createElement("div");
			cardDesc.className = "desc";
			cardDesc.textContent = client.short || "";

			const cardActions = document.createElement("div");
			cardActions.className = "actions";

			if (client.downloadUrl) {
				const downloadButton = document.createElement("a");
				downloadButton.className = "btn primary";
				downloadButton.href = client.downloadUrl;
				downloadButton.target = "_blank";
				downloadButton.rel = "noopener noreferrer";
				downloadButton.textContent = `Get ${client.name}`;
				downloadButton.addEventListener("click", (e) => e.stopPropagation());
				cardActions.appendChild(downloadButton);
			}

			if (client.importHref) {
				const connectButton = document.createElement("a");
				connectButton.className = "btn neutral";
				connectButton.href = resolveAssetPath(client.importHref);
				if (!client.importHref.startsWith("http")) {
					connectButton.download = "";
				}
				connectButton.textContent = client.importLabel || "Connect";
				connectButton.addEventListener("click", (e) => e.stopPropagation());
				cardActions.appendChild(connectButton);
			}

			const expandIndicator = document.createElement("div");
			expandIndicator.className = "expand-indicator";
			expandIndicator.textContent = "> Expand";

			cardBody.appendChild(cardTitle);
			cardBody.appendChild(cardDesc);
			cardBody.appendChild(cardActions);
			cardBody.appendChild(expandIndicator);

			cardHeader.appendChild(logoThumb);
			cardHeader.appendChild(cardBody);

			const expandedPanel = document.createElement("div");
			expandedPanel.className = "expander-panel card";
			expandedPanel.hidden = true;

			const panelBodyContainer = document.createElement("div");
			panelBodyContainer.className = "body";

			const panelTitle = document.createElement("div");
			panelTitle.className = "title";
			panelTitle.textContent = client.name;

			const panelDesc = document.createElement("div");
			panelDesc.className = "desc";
			panelDesc.textContent = client.short || "";

			const instructionsList = document.createElement("div");
			instructionsList.className = "instructions";
			renderInstructions(instructionsList, client.instructions || "");

			const panelActions = document.createElement("div");
			panelActions.className = "actions";

			if (client.downloadUrl) {
				const panelDownloadBtn = document.createElement("a");
				panelDownloadBtn.className = "btn primary";
				panelDownloadBtn.href = client.downloadUrl;
				panelDownloadBtn.target = "_blank";
				panelDownloadBtn.rel = "noopener noreferrer";
				panelDownloadBtn.textContent = `Get ${client.name}`;
				panelActions.appendChild(panelDownloadBtn);
			}

			if (client.importHref) {
				const panelImportBtn = document.createElement("a");
				panelImportBtn.className = "btn neutral";
				panelImportBtn.href = resolveAssetPath(client.importHref);
				panelImportBtn.download = "";
				panelImportBtn.textContent = client.importLabel || "Import";
				panelActions.appendChild(panelImportBtn);
			} else if (!client.downloadUrl) {
				const importNote = document.createElement("div");
				importNote.className = "hint";
				importNote.textContent = "No download or import available";
				panelActions.appendChild(importNote);
			}

			panelBodyContainer.appendChild(instructionsList);
			panelBodyContainer.appendChild(panelActions);
			expandedPanel.appendChild(panelBodyContainer);

			expanderContainer.appendChild(cardHeader);
			expanderContainer.appendChild(expandedPanel);

			fragment.appendChild(expanderContainer);
		});

		host.appendChild(fragment);

		const EXPANDER_DELEGATED = "delegated";
		if (host.dataset.expanderDelegated !== EXPANDER_DELEGATED) {
			host.addEventListener("click", (event) => {
				const clickTarget = event.target;
				if (!(clickTarget instanceof Element)) return;

				if (clickTarget.closest(".actions")) return;

				const headerElement = clickTarget.closest(".expander-head");
				if (!headerElement || !host.contains(headerElement)) return;

				const containerElement = headerElement.closest(".expander");
				const panelElement = containerElement?.querySelector(".expander-panel");
				if (!panelElement) return;

				const isExpanded =
					headerElement.getAttribute("aria-expanded") === "true";
				headerElement.setAttribute(
					"aria-expanded",
					isExpanded ? "false" : "true",
				);
				panelElement.hidden = isExpanded;
				containerElement.classList.toggle("expanded", !isExpanded);

				const indicatorElement =
					headerElement.querySelector(".expand-indicator");
				if (indicatorElement) {
					indicatorElement.textContent = isExpanded ? "> Expand" : "< Collapse";
				}
			});

			host.addEventListener("keydown", (event) => {
				const keyTarget = event.target;
				if (!(keyTarget instanceof Element)) return;

				const headerElement = keyTarget.closest(".expander-head");
				if (!headerElement || !host.contains(headerElement)) return;

				if (event.key === "Enter" || event.key === " ") {
					event.preventDefault();
					headerElement.click();
				}
			});

			host.dataset.expanderDelegated = EXPANDER_DELEGATED;
		}
	} catch (error) {
		console.error("Failed to mount expanders:", error);
		host.innerHTML =
			'<div class="error-message">Failed to load FTP info - check neuro-ftp-clients.json?</div>';
		throw error;
	}
}
