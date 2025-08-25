# neuro links (click them)

site for hosting aggregated list of maintained neuro-sama related projects & websites in a simple card layout

## TODO

Pending

Possible tasks:

- Fix color scheme & random UI quirks from being hastily put together

## Status

- Static page which loads static JSON data and displays it in a card layout
- Small helper to make adding pages less manual (still pretty manual), info below
- The small helper added ~30,000 files because Python—my bad

## Helper Script

To add a page to the site, run:

```bash
python3 add_page.py --name "Title" --description "Text" --image "assets/images/x.png" --href "/path"
```

### Install `add_page.py` Locally

You can install `add_page.py` locally in a virtual environment or system-wide:

```bash
uv venv
source .venv/bin/activate
uv pip install -e .
```

Then you can run it from anywhere with:

```bash
add-page --name "Title" --description "Text" --image "assets/images/x.png" --href "/path"
```

### `add_page.py` Notes

- `data/pages.json` should be an array of objects. It won't break if it's an object, but will be upset.
- Creates a `.bak` backup before writing. Secure!
- Use `--fake` to preview changes before modifying `pages.json`. Example:

```bash
add-page --name "Title" --description "Text" --image "assets/images/x.png" --href "/path" --fake
```

Output:

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
