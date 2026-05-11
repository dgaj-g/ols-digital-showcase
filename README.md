# OLS Digital Showcase

Twenty-six small interactive activities — one per department — built for the OLS staff digital skills training session in May 2026.

**Live site:** https://dgaj-g.github.io/ols-digital-showcase/

## How this works

- Pure HTML + CSS + JavaScript. No build step, no `node_modules`, no backend.
- The hub page (`index.html`) lists all 26 departments. The list is driven by the `DEPARTMENTS` array in `script.js`.
- Each department has its own folder (kebab-case, e.g. `mathematics/`, `french/`) containing its own `index.html`, optional `style.css`, optional `script.js`, and an `assets/` folder for any local files.
- Each demo can have its own visual world (palette, fonts, mechanics) — they share only a thin top strip for branding/navigation, defined as `.demo-strip` in the root `style.css`.

## Repo structure

```
ols-digital-showcase/
├── index.html          Hub
├── style.css           Shared OLS branding + demo-strip
├── script.js           Hub interactivity + DEPARTMENTS data
├── assets/
│   ├── crest.png         (1.7 MB high-res — hub hero)
│   ├── crest-256.png     (used by hub hero)
│   ├── crest-64.png      (used on each demo's top strip)
│   └── favicon-32.png
└── <department-slug>/
    ├── index.html
    ├── style.css        (demo-specific palette)
    ├── script.js        (demo logic)
    └── assets/          (images / audio for this demo)
```

## Adding a new demo

1. Add the department's entry to `DEPARTMENTS` in `script.js` (slug, name, level, board, topic, activity).
2. Create the folder `<slug>/` with at minimum an `index.html`. Copy this skeleton:

```html
<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Department — Topic · OLS Showcase</title>
  <link rel="icon" href="../assets/favicon-32.png" type="image/png">
  <link rel="stylesheet" href="../style.css">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="demo-strip">
    <a class="back" href="../">← Back to showcase</a>
    <img class="crest-small" src="../assets/crest-64.png" alt="">
    <span class="title">Department</span>
    <span class="meta">Level · Topic</span>
  </div>
  <main>
    <!-- The demo itself -->
  </main>
  <script src="script.js"></script>
</body>
</html>
```

3. Use relative paths (`../assets/…`, not `/assets/…`) so the folder also opens correctly when copied off-line.

## Design constraints

- Must work on phone (≥ 360px), Chromebook (≥ 1024px), Promethean board (≥ 1920px).
- Must work on C2K (filtered NI schools network). No external APIs requiring keys. CDNs are OK; vendor them if blocked.
- No logins, no accounts, no PII.
- OLS brand: deep blue `#1A3A6B`, gold `#E4B824`, borders `#595959`.
- No emojis in any user-facing copy.

## Local preview

```bash
cd ols-digital-showcase
python3 -m http.server 8000
# open http://localhost:8000
```

---

Built by Damien Gartland, Director of ICT — Our Lady's Grammar School, Newry — May 2026.
