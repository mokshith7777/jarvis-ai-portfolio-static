# BRIEF.md — JARVIS AI · Cinematic 3D Portfolio
> Source of truth for the build. Edit anything in [brackets]. Final reference = a still
> render / mockup compared against this brief.

## Site identity
- **This is the portfolio of JARVIS AI** — a voice-first AI product.
- **Owner / creator:** Mokshith Reddy — Founder & Owner of JARVIS AI. (stated explicitly at
  the end of the page — see "Owner" section.)

## Look & feel (your words: cinematic, artistic, futuristic, heroic)
Two reference motifs drive the art direction — we borrow their *motion language + palette*,
stylized as homage (NOT literal likeness clones — see IP note below):

1. **Spider-Man (Andrew Garfield / The Amazing Spider-Man)**
   - Sleek, agile, technical. Web-shooter precision, expressive mask eyes.
   - Motion: fast, weightless, web-swing arcs; urban-night cinematic.
   - Palette: deep red + midnight blue + electric cyan; glossy, wet-look surfaces.

2. **Prabhas (Baahubali / Kalki 2898 AD)**
   - Epic scale, regal warrior, golden armor, sci-fi grandeur.
   - Motion: slow, powerful, monumental; gravity that feels earned.
   - Palette: warm gold + bronze + obsidian; volumetric god-rays, dust.

**Fused hero concept:** a central JARVIS "core" wrapped in **web-strand filaments** (Spidey
motion: they flex/snap like swinging cables) inside a **regal golden ring/halo** (Prabhas
grandeur) — a cinematic, futuristic, heroic centerpiece. Both elements animate in 3D.

## IP / buildability note (important, honest)
- We will NOT reproduce the actual faces/likenesses of Spider-Man or Prabhas (trademark +
  likeness rights). The scene is *inspired by* their aesthetics.
- This build environment has no 3D-modeling tool or GPU, so we cannot generate rigged
  character models from photos here. Two clean paths:
  - **A) Procedural (default, free, no assets):** build the hero from Three.js geometry
    (icosahedron core + tube/line "web" filaments + torus "halo") with the two palettes.
  - **B) You supply a licensed `.glb`:** drop it in `assets/`, load via `GLTFLoader`, apply
    Mixamo/Ready-Player-Me animation. We theme lighting/bloom around it.
- Either way it's real WebGL 3D, scroll-driven, GitHub-Pages-deployable.

## Hero 3D scene (default = path A, procedural)
- **Core:** faceted icosahedron, metalness, cyan emissive; thin wireframe overlay.
- **Web filaments (Spidey motif):** ~12 `TubeGeometry`/`Line` strands arcing from core to
  ring; in the animation loop they flex (sine offset) like swinging cables; brighten on scroll.
- **Golden halo (Prabhas motif):** `TorusGeometry` ring, gold `MeshStandardMaterial`, slow
  rotation; a soft volumetric key light gives the "epic" falloff.
- **Particles:** drifting dust field, additive blend, cyan+gold mix.
- **Post:** `EffectComposer` + `UnrealBloomPass` (the cinematic glow). Vignette pass.
- **Palette (hex):** void `#05070d` · core glow `#4f9dff` · web cyan `#7af6ff` ·
  spidey red `#ff3b4e` · gold `#ffb86b` · text `#e8eefc` / muted `#8a96b3`.

## Scroll behaviour (signature interaction)
- Tall page; hero canvas `position:fixed; inset:0` behind content.
- Scroll forward: camera pushes **into** the core; web filaments flex outward (swing); golden
  halo rotates to face camera; particles parallax. Chapter text fades in order.
- Scroll back: exact reverse (camera/object state = pure function of scroll progress).
- `prefers-reduced-motion`: static framed render + plain stacked sections, no WebGL motion.

## Typography voice
- Display: Space Grotesk / Inter (tight, geometric). Body: same, lighter.
- Copy SHORT + concrete. Real HTML text over the canvas — never baked into 3D.

## Sections (scroll order)
1. **Hero** — 3D core + "JARVIS AI" wordmark + tagline (scroll camera sequence).
2. **About JARVIS** — what the AI is, 2–3 short paragraphs.
3. **Showcase** — project grid. Include **JARVIS AI**
   (`#`) + 2–3 others.
4. **Story / Craft** — how it's built (edge inference, ambient UI, free-tier-first).
5. **Owner** — *About the creator:* **Mokshith Reddy — Founder & Owner of JARVIS AI.**
   Short bio: builder of voice-first AI, the person behind JARVIS. This is the explicit
   "I am the owner of this JARVIS AI" close.

## Navigation labels (= scroll chapters)
`Home · About · Work · Craft · Owner`

## Stack decision (default)
- **Vanilla Three.js via CDN ESM importmap** — no build. Local preview:
  `python3 -m http.server` (ES modules need http; GitHub Pages = https, fine).
- Alternative: Astro + React Three Fiber for richer authored sections.

## Deliverables checklist
- [ ] This brief confirmed
- [ ] `reference/mockup.jpg` — still of intended 3D look (generated or early prototype grab)
- [ ] `index.html`, `styles.css`, `main.js` (Three.js hero + scroll rig + web/halo animation)
- [ ] `assets/` (textures / optional licensed `.glb`)
- [ ] Scroll-capture verified vs reference before sign-off
