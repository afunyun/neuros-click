/**
 * FTP page version of cards w/ expansion panels
 * @typedef {Object} Client
 * @property {string} id
 * @property {string} name
 * @property {string=} icon
 * @property {string=} short
 * @property {string=} instructions
 * @property {string|null} downloadUrl
 * @property {string=} importHref
 * @property {string=} importLabel
 */

/**
 * @param {HTMLElement} listEl
 * @param {string=} instructions
 * @private
 */
function _renderInstructions(listEl, instructions) {
	listEl.innerHTML = ''
	const frag = document.createDocumentFragment();
	(instructions || '')
		.split('\n')
		.filter(Boolean)
		.forEach((line) => {
			const div = document.createElement('div')
			div.className = 'step'
			div.textContent = line
			frag.appendChild(div)
		})
	listEl.appendChild(frag)
}

/**
 * creates action buttons container
 * @param {Client} client
 * @param {boolean} isPanel
 * @returns {HTMLDivElement}
 * @private
 */
function _createActionButtons(client, isPanel = false) {
	const actions = document.createElement('div')
	actions.className = 'actions'

	// stop click propagation to prevent expander toggle
	actions.addEventListener('click', (e) => e.stopPropagation())

	if (client.downloadUrl) {
		const downloadButton = document.createElement('a')
		downloadButton.className = 'btn primary'
		downloadButton.href = client.downloadUrl
		downloadButton.target = '_blank'
		downloadButton.rel = 'noopener noreferrer'
		downloadButton.textContent = `Get ${client.name}`
		actions.appendChild(downloadButton)
	}

	if (client.importHref) {
		const importButton = document.createElement('a')
		importButton.className = 'btn neutral'
		importButton.href = client.importHref
		if (
			!client.importHref.startsWith('http') &&
			!client.importHref.startsWith('winscp')
		) {
			importButton.download = ''
		}
		importButton.textContent = client.importLabel || 'Connect'
		actions.appendChild(importButton)
	}

	// only show hint in expanded panel
	if (isPanel && !client.downloadUrl && !client.importHref) {
		const importNote = document.createElement('div')
		importNote.className = 'hint'
		importNote.textContent = 'No download or import available'
		actions.appendChild(importNote)
	}

	return actions
}

/**
 * @param {HTMLElement|null} host
 * @param {Client[]} clients
 */
export function mountExpanders(host, clients) {
	if (!host) {
		console.warn('Cannot mount expanders: no host element')
		return
	}

	if (!Array.isArray(clients)) {
		console.warn('Cannot mount expanders: clients should be an array')
		return
	}

	try {
		host.innerHTML = ''
		const fragment = document.createDocumentFragment()

		clients.forEach((client) => {
			const expanderContainer = document.createElement('div')
			expanderContainer.className = 'expander'
			expanderContainer.dataset.id = client.id

			const cardHeader = document.createElement('div')
			cardHeader.className = 'card expander-head'
			cardHeader.setAttribute('role', 'button')
			cardHeader.setAttribute('tabindex', '0')
			cardHeader.setAttribute('aria-expanded', 'false')

			const logoThumb = document.createElement('div')
			logoThumb.className = 'thumb'
			const logoImg = document.createElement('img')
			logoImg.src = client.icon || ''
			logoImg.alt = ''
			logoImg.loading = 'lazy'
			logoImg.decoding = 'async'
			logoImg.width = 120
			logoImg.height = 120
			logoThumb.appendChild(logoImg)

			const cardBody = document.createElement('div')
			cardBody.className = 'body'

			const cardTitle = document.createElement('div')
			cardTitle.className = 'title'
			cardTitle.textContent = client.name

			const cardDesc = document.createElement('div')
			cardDesc.className = 'desc'
			cardDesc.textContent = client.short || ''

			const expandIndicator = document.createElement('div')
			expandIndicator.className = 'expand-indicator'
			expandIndicator.textContent = '> Expand'

			cardBody.appendChild(cardTitle)
			cardBody.appendChild(cardDesc)
			cardBody.appendChild(_createActionButtons(client, false))
			cardBody.appendChild(expandIndicator)

			cardHeader.appendChild(logoThumb)
			cardHeader.appendChild(cardBody)

			const expandedPanel = document.createElement('div')
			expandedPanel.className = 'expander-panel card'
			expandedPanel.hidden = true

			const panelBodyContainer = document.createElement('div')
			panelBodyContainer.className = 'body'

			const instructionsList = document.createElement('div')
			instructionsList.className = 'instructions'
			_renderInstructions(instructionsList, client.instructions || '')

			panelBodyContainer.appendChild(instructionsList)
			panelBodyContainer.appendChild(_createActionButtons(client, true))

			expandedPanel.appendChild(panelBodyContainer)

			expanderContainer.appendChild(cardHeader)
			expanderContainer.appendChild(expandedPanel)

			fragment.appendChild(expanderContainer)
		})

		host.appendChild(fragment)

		// delegation for events
		const EXPANDER_DELEGATED = 'delegated'
		if (host.dataset.expanderDelegated !== EXPANDER_DELEGATED) {
			host.addEventListener('click', (event) => {
				const clickTarget = event.target
				if (!(clickTarget instanceof Element)) return
				if (clickTarget.closest('.actions')) return

				const headerElement = clickTarget.closest('.expander-head')
				if (!headerElement || !host.contains(headerElement)) return

				const containerElement = headerElement.closest('.expander')
				const panelElement = containerElement?.querySelector('.expander-panel')
				if (!panelElement) return

				const isExpanded = headerElement.getAttribute('aria-expanded') === 'true'
				headerElement.setAttribute('aria-expanded', isExpanded ? 'false' : 'true')
				panelElement.hidden = isExpanded
				containerElement.classList.toggle('expanded', !isExpanded)

				// hide the buttons on the original card if the expansion is open so there's not 2 sets
				const originalActions = headerElement.querySelector('.actions')
				if (originalActions) {
					originalActions.style.display = isExpanded ? '' : 'none'
				}

				const indicatorElement = headerElement.querySelector('.expand-indicator')
				if (indicatorElement) {
					indicatorElement.textContent = isExpanded ? '> Expand' : '< Collapse'
				}
			})

			host.addEventListener('keydown', (event) => {
				const keyTarget = event.target
				if (!(keyTarget instanceof Element)) return

				const headerElement = keyTarget.closest('.expander-head')
				if (!headerElement || !host.contains(headerElement)) return

				if (event.key === 'Enter' || event.key === ' ') {
					event.preventDefault()
					headerElement.click()
				}
			})

			host.dataset.expanderDelegated = EXPANDER_DELEGATED
		}
	} catch (error) {
		console.error('Failed to mount expanders:', error)
		host.innerHTML = '<div class="error-message">Failed to load FTP info.</div>'
		throw error
	}
}
