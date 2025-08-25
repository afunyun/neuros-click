a website for neuro sama community ran site aggregation (manual)

## TODO:
pending

possible:

 - fix color scheme & fix random ui quirks from being hastily put together

# status:

- static page which loads static json data and displays it in a card layout
- small helper to make adding pages less manual (still pretty manual) info below
- the small helper added like 30000 files because python, my bad

## Helper script

If you want to add a page to the site, you can run something like:
```bash
python3 add_page.py --name "Title" --description "Text" --image "assets/images/x.png" --href "/path"
```

### if you want you can also install add_page.py locally either in a venv or system wide

```bash
uv venv
source .venv/bin/activate
uv pip install -e .
```

### then you can run it essentially wherever you are with:
```bash
add-page --name "Title" --description "Text" --image "assets/images/x.png" --href "/path"
```

### add_page.py notes (in file too)

- data/pages.json should be an array of objects. wont explode if it's an object but will be upset
- clogs up your repo with .bak backup before writing. Secure!
- Use --fake see if you're doing it right before destroying your pages.json, example:

run:
```sh
add-page --name "Title" --description "Text" --image "assets/images/x.png" --href "/path" --fake
```

you'll see:

```json
Would append the following entry to data/pages.json:

{
  "name": "Title",
  "description": "Text",
  "image": "assets/images/x.png",
  "href": "/path"
}

No changes written due to --fake.
```