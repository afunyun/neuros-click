# superbox's neuro link containment cell (click them)

site for hosting aggregated list of personally maintained neuro-sama related projects & websites in a simple card layout

## Most recent changes

- final (hopefully) change to relative links for the neuro_ftp page so it works both on local dev and github pages deployment
  - Uses a function to calculate the base path based on current URL depth and prepends that to all asset paths

## TODO

- add actual page links when they're given to me
- random changes per superbox mainly

## Status

- Static page which loads static JSON data and displays it in a card layout
- Separate page for FTP connection help
- js/css/html constructing the pages without need for much if any external libraries or backend
- mobile layout mostly works but needs polish
- moar expandable now with refactor

folder structure ~~v1~~ ~~v2~~ ~~v3~~ v4 (surely the last)

```md
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
