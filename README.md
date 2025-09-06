# superbox's neuro link containment cell (click them)

site for hosting aggregated list of personally maintained neuro-sama related projects & websites in a simple card layout


## Most recent changes

- reorganized structure of folders (again...)... again
- refactored the js into modules because it was getting monolithic 
- updated the layout to work better for very narrow//mobile screens (reactive layout)
- normalized size of the images for consistency especially in the way the site scales width-wise
- fixed the broken links from reorganizing - all internal linking is now explicit to the structure of the folder layout
- added config for non-specific ftp client connections along with the previously added configs.

## TODO

- dedup css again, there are certainly some unused classes in there now
- fix the layout of the very top of the page for VERY narrow screens as the buttons and site title/logo are competing for the space 
    - will be moving having the buttons have a similar moving behavior to the descriptions on the cards when the layout is too narrow - they will either move under the title text or stack on each other vertically to make horizontal room. 

## Status

- Static page which loads static JSON data and displays it in a card layout
- Separate page for FTP connection help
- js/css/html constructing the pages without need for much if any external libraries or backend
  - UI components for cards, theme, footer, expansion behavior
  - Service layer for app control and site configuration
  - Utility functions for DOM manipulation
  - Shared data loading and type definitions
- mobile layout mostly works but needs polish
- moar expandable now with refactor

folder structure ~~v1~~ ~~v2~~ ~~v3~~ v4 (surely the last)

```
/
|-- index.html
|-- neuro_ftp/
|   |-- index.html
|-- assets/
|   |-- css/
|   |   |-- styles.css
|   |-- js/
|   |   |-- index.js
|   |   |-- data.js
|   |   |-- types.js
|   |   |-- services/
|   |   |   |-- app-controller.js
|   |   |   |-- site-config.js
|   |   |-- ui/
|   |   |   |-- cards.js
|   |   |   |-- expander.js
|   |   |   |-- footer.js
|   |   |   |-- theme.js
|   |   |-- utils/
|   |       |-- dom.js
|   |-- images/
|   |   |-- neurov3-logo.png
|   |   |-- evilv3-logo.png
|   |   |-- winscp-logo.png
|   |   |-- filezilla-logo.png
|   |   |-- etc...
|   |-- fonts/
|   |   |-- First Coffee.woff2
|   |-- json/
|   |   |-- pages.json
|   |   |-- site.json
|   |   |-- neuro-ftp-clients.json
|   |-- share/
|       |-- neuros-click-filezilla.xml
```

`index.html` (webroot) loads `assets/js/index.js` which bootstraps the app via `services/app-controller.js`, loading `assets/json/pages.json` and `assets/json/site.json`.

`neuro_ftp/index.html` loads the same entry but uses `ui/expander.js` and `assets/json/neuro-ftp-clients.json`.
