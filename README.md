# superbox's neuro link containment cell (click them)

site for hosting aggregated list of personally maintained neuro-sama related projects & websites in a simple card layout

## TODO



## Most recent changes

- reorganized structure of folders (again...)
- add the swapping eliv/nwero images on the logobox
- add centralized FTP browsing

## Status

- Static page which loads static JSON data and displays it in a card layout
- separate page for FTP connection info with links to connect via winSCP directly or download a FileZilla config
    - this also made it such that the card system from app.js can be used across multiple pages 
        - previously it was set up in a way that it always loaded the cards from pages.json etc which isn't ideal. More modular. 
- structure is more expandable with subfolders for each type of asset to load in a way that makes sense.
- css is long but pretty much everything is used.
- overall works as a static site

folder structure ~~v1~~ ~~v2~~ v3

```
/
|-- index.html
|-- neuro_ftp.html
|-- assets/
|   |-- css/
|   |   |-- styles.css
|   |-- js/
|   |   |-- app.js
|   |-- images/
|   |   |-- neurov3-logo.png
|   |   |-- evilv3-logo.png
|   |   |-- etc...
|   |-- fonts/
|   |   |-- First Coffee.woff2
|   |-- json/
|       |-- pages.json
|       |-- site.json
```

`index.html` (webroot) loads `assets/js/app.js` which loads `assets/json/pages.json` pages meant to use assets in subfolders such as `assets/images/`

