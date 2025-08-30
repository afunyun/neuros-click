# superbox's neuro link containment cell (click them)

site for hosting aggregated list of personally maintained neuro-sama related projects & websites in a simple card layout

## TODO

- add the swapping eliv/nwero images on the logobox
- add centralized FTP browsing

## Most recent changes

- Eliv dark theme no longer using poop brown
- Made grid entries for each site will redirect on 1st click
- fixed consistency with auto vs manual themes being different
- updated tests to have images 

## Status

- Static page which loads static JSON data and displays it in a card layout
- defeated the helper menace 
- css is comprehensible
- overall works as a static site

the folder structure was bad because i didnt plan properly so fixed that to make actual sense:

```
neuros-click/
---> index.html
---> data/
|   ---> pages.json
|   ---> site.json
|   ---> images/
|       ---> vedal.png
|       ---> hiyori-test.png
|       ---> <any-site-image.png>
---> src/
|   ---> styles.css
|   ---> app.js
|   ---> fonts/
|       ---> First Coffee.woff2
```

`index.html` loads `src/app.js` which loads `data/pages.json` pages meant to use assets in subfolders such as `data/images/`

