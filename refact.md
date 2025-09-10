
# changes to make

/
├── index.html
├── neuro_ftp/
│   └── index.html
├── fund_nsp/
│   └── index.html
├── js/
│   ├── main.js
│   ├── cards.js
│   ├── expander.js
│   └── theme.js
├── css/
│   └── styles.css
├── images/
│   ├── [all images except the favicons which should stay in the root]
├── data/
│   ├── site.json
│   ├── pages.json
│   └── neuro-ftp-clients.json
├── fonts/
│   └── First Coffee.woff2
└── [root level files]

## neuro synth content & donation page

*NeuroSynthProject* - page title

*Always open* - explains what the page is about, and what the money gained will be used for
*Starts closed* (expandable) - one for donate and one for commission

- Donations - explains the available donation methods
  - crypto
  - ask directly

- Commissions - has the commission pricing
  - prompts to message Superbox on Discord for more info

## smash js back together

- main.js - Combines app-controller, site-config, data fetching, and DOM utilities
- cards.js - Pure card rendering logic
- expander.js - Pure FTP expander logic
- theme.js - Standalone theme functionality

## organization

- images/ - All images at top level (easier to reference)
- images/icons/ - Favicon files grouped together
- data/ - JSON files (clearer than "json" folder name)
- css/ and fonts/ - Direct, no nesting

## removals

- No services/ui/utils abstraction layers
- No types.js (move JSDoc to individual files)
- No separate footer.js (inline in main.js)
- Remove images-archive (cleanup)

Benefits

1. Simpler imports - ../js/main.js instead of ../assets/js/services/app-controller.js
2. Easier file location - Everything logically grouped at top level
3. Reduced path complexity - Shorter, clearer paths
4. Maintains separation - Still keeps related code in separate files where it makes sense
