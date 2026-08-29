# JARVIS AI — Cinematic 3D Portfolio

A freestanding, single-page cinematic 3D portfolio for **JARVIS AI**, built with
**vanilla Three.js** (no build step, no framework). Deploys as static files to GitHub Pages.

## Run locally
ES modules require http (not `file://`):

```bash
cd scroll-portfolio
python3 -m http.server 8080
# open http://localhost:8080
```

## Deploy to GitHub Pages
1. Create a repo on GitHub (e.g. `jarvis-ai-portfolio`).
2. Push this folder and let Actions build:

```bash
git init
git add .
git commit -m "JARVIS AI cinematic 3D portfolio"
git branch -M main
git remote add origin https://github.com/<you>/jarvis-ai-portfolio.git
git push -u origin main
```

3. GitHub → repo **Settings → Pages → Build and deployment → Source: GitHub Actions**.
   The site publishes at `https://<you>.github.io/jarvis-ai-portfolio/`.

## Files
- `index.html` — 5 sections: Home, About, Work, Craft, Owner (bio for Mokshith Reddy)
- `styles.css` — cinematic dark theme, glass cards, scroll reveal, reduced-motion fallback
- `main.js` — Three.js hero: JARVIS core + cyan wireframe, web filaments (Spidey motif),
  golden halo (Prabhas motif), particle field, UnrealBloom, scroll-driven camera

## Before shipping
- Replace `YOUR_WEB3FORMS_KEY` in `index.html` (free key at web3forms.com).
- Art direction is a *stylized homage* to the Spider-Man (Andrew Garfield) and Prabhas
  references via geometry + palettes — not likenesses/IP of those properties.
