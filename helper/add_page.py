#!/usr/bin/env python3
"""
why yes i have used python for this for some reason
very simple - to use run something like:
  python3 add_page.py --name "Title" --description "Text" --image "assets/images/x.png" --href "/path"

  - data/pages.json should be an array of objects. wont explode if it's an object but will be upset
  - clogs up your repo with .bak backup before writing. Secure!
  - Use --fake see if you're doing it right before destroying your pages.json
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
import shutil
import sys


def load_pages(pages_path: Path):
    if not pages_path.exists():
        return [], "array"

    try:
        with pages_path.open("r", encoding="utf-8") as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        print(f"{pages_path} not valid JSON: {e}", file=sys.stderr)
        sys.exit(1)

    if isinstance(data, list):
        return data, "array"
    if isinstance(data, dict) and isinstance(data.get("pages"), list):
        return data["pages"], "object-with-pages"

    print(
        f"{pages_path} expected to be a JSON array or an object with a 'pages' array.",
        file=sys.stderr,
    )
    sys.exit(1)


def write_pages(pages_path: Path, pages, mode: str, original_data=None):
    if pages_path.exists():
        backup_path = pages_path.with_suffix(pages_path.suffix + ".bak")
        try:
            shutil.copy2(pages_path, backup_path)
        except Exception as e:
            print(f"Backup failed: {e}", file=sys.stderr)

    out = pages
    if mode == "object-with-pages":
        obj = dict(original_data or {})
        obj["pages"] = pages
        out = obj

    pages_path.parent.mkdir(parents=True, exist_ok=True)
    with pages_path.open("w", encoding="utf-8") as f:
        json.dump(out, f, indent=2, ensure_ascii=False)
        f.write("\n")


def main():
    parser = argparse.ArgumentParser(description="Append a page to data/pages.json")
    parser.add_argument("--name", required=True, help="Title. Self explanatory")
    parser.add_argument(
        "--description", required=True, help="Text to show below the title"
    )
    parser.add_argument(
        "--image",
        required=True,
        help="Path to the card image, relative to run location",
    )
    parser.add_argument("--href", required=True, help="URL the card links to")
    parser.add_argument("--fake", action="store_true", help="test without writing")

    args = parser.parse_args()

    repo_root = Path(__file__).resolve().parents[1]
    pages_path = repo_root / "data" / "pages.json"

    mode_data = None
    if pages_path.exists():
        with pages_path.open("r", encoding="utf-8") as f:
            try:
                original = json.load(f)
            except json.JSONDecodeError as e:
                print(f"{pages_path} not valid JSON: {e}", file=sys.stderr)
                sys.exit(1)
        if isinstance(original, list):
            pages, mode = original, "array"
            mode_data = None
        elif isinstance(original, dict) and isinstance(original.get("pages"), list):
            pages, mode = original["pages"], "object-with-pages"
            mode_data = original
        else:
            print(
                f"{pages_path} expected to be... JSON... or an object with a 'pages' array. It is neither.",
                file=sys.stderr,
            )
            sys.exit(1)
    else:
        pages, mode = [], "array"

    new_entry = {
        "name": args.name,
        "description": args.description,
        "image": args.image,
        "href": args.href,
    }

    pages.append(new_entry)

    if args.fake:
        print("Would append the following entry to data/pages.json:\n")
        print(json.dumps(new_entry, indent=2, ensure_ascii=False))
        print("\nNo changes written due to --fake.")
        return

    write_pages(pages_path, pages, mode, mode_data)
    print(f"Added page to {pages_path}:")
    print(json.dumps(new_entry, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
