"""Build the static pages of The Leisure Club site.

    python _build/build.py

Each file in _build/pages/ is a page body with a small header comment:

    <!--
    title: Page title
    description: Meta description
    nav: fitness            (which primary nav item is current)
    crumb: Fitness & Performance   (breadcrumb label; omit on the homepage)
    header: hero | solid
    scripts: assets/lang/fitness.js, assets/schedule.js
    -->

Shortcode for media placeholders (no photography yet):

    <ph r="4x5" tag="Photo" t="Indoor pool" b="Brief for the photographer" cls="ph--dark" x='data-parallax="0.1"'/>

The output is plain HTML written to the site root, so Vercel serves it as-is.
"""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = Path(__file__).resolve().parent
SITE = "https://theleisureclub-lb.com/"

HEAD = (SRC / "layout_head.html").read_text(encoding="utf-8")
FOOT = (SRC / "layout_foot.html").read_text(encoding="utf-8")
HOME_JSONLD = (SRC / "_jsonld_home.html").read_text(encoding="utf-8")


def parse(page_text):
    m = re.match(r"\s*<!--(.*?)-->\s*", page_text, re.S)
    meta = {}
    if m:
        for line in m.group(1).strip().splitlines():
            if ":" in line:
                k, v = line.split(":", 1)
                meta[k.strip()] = v.strip()
        page_text = page_text[m.end():]
    return meta, page_text


def attrs(s):
    out = dict(re.findall(r'(\w+)="([^"]*)"', s))
    out.update(dict(re.findall(r"(\w+)='([^']*)'", s)))
    return out


def ph(match):
    a = attrs(match.group(1))
    r = a.get("r", "16x9")
    tag = a.get("tag", "Photo")
    title = a.get("t", "")
    brief = a.get("b", "")
    cls = ["ph", "r-" + r] if r != "free" else ["ph"]
    if any(w in tag.lower() for w in ("film", "video")):
        cls.append("ph--video")
    if a.get("cls"):
        cls.append(a["cls"])
    extra = (" " + a["x"]) if a.get("x") else ""
    ratio = "" if r == "free" else f'<span class="ph__ratio">{r.replace("x", ":")}</span>'
    body = f'<p class="ph__brief"><b>{title}</b>{brief}</p>' if (title or brief) else ""
    label = html.escape(f"Placeholder: {title or tag}", quote=True)
    return (f'<div class="{" ".join(cls)}" role="img" aria-label="{label}"{extra}>'
            f'<span class="ph__tag">{tag}</span>{ratio}{body}</div>')


def breadcrumb_jsonld(label, path):
    data = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": SITE},
            {"@type": "ListItem", "position": 2, "name": label, "item": SITE + path},
        ],
    }
    return '  <script type="application/ld+json">\n  ' + json.dumps(data, ensure_ascii=False) + "\n  </script>"


def build(src_file):
    meta, body = parse(src_file.read_text(encoding="utf-8"))
    name = src_file.stem
    out_name = f"{name}.html"
    path = "" if name == "index" else out_name

    body = re.sub(r"<ph\s+(.*?)/>", ph, body, flags=re.S)

    head = HEAD
    head = head.replace("{{TITLE}}", html.escape(meta.get("title", "The Leisure Club"), quote=True))
    head = head.replace("{{DESCRIPTION}}", html.escape(meta.get("description", ""), quote=True))
    head = head.replace("{{PATH}}", path)
    header_class = "site-header on-hero" if meta.get("header") == "hero" else "site-header is-solid"
    head = head.replace("{{HEADER_CLASS}}", header_class)
    jsonld = HOME_JSONLD if name == "index" else breadcrumb_jsonld(meta.get("crumb", meta.get("title", "")), path)
    head = head.replace("{{JSONLD}}", jsonld)
    nav = meta.get("nav")
    if nav:
        head = head.replace(f'data-nav="{nav}"', f'data-nav="{nav}" aria-current="page"')

    scripts = [s.strip() for s in meta.get("scripts", "").split(",") if s.strip()]
    tags = "\n".join(f'  <script src="{s}" defer></script>' for s in scripts)
    foot = FOOT.replace("{{SCRIPTS}}", tags)

    page = head + '<main id="main">\n' + body.rstrip() + "\n  </main>" + foot
    if name == "404":
        # served at any missing URL, so every local reference must be root-relative
        page = re.sub(r'((?:href|src)=")(?!https?:|/|#|mailto:|tel:|data:)', r"\1/", page)
    (ROOT / out_name).write_text(page, encoding="utf-8", newline="\n")
    return out_name


if __name__ == "__main__":
    built = [build(p) for p in sorted((SRC / "pages").glob("*.html"))]
    print("built:", ", ".join(built))
