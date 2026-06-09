# CLAUDE.md — TrainWithKen Website Project

> This file gives Claude Code full context on the project, the brand, the person behind it, and the rules for every session. Read this before touching any file.

---

## 👤 About the Client

**Name:** Ken Jones (goes by KJ)
**Brand:** TrainWithKen
**Website:** trainwithken.fit
**Instagram:** @trainwithken
**Location:** Houston, Texas
**Facility:** Level One Fitness — 1803 Cleburne St, Houston TX 77004

**Who KJ is:**
- IFBB Pro bodybuilder — Men's Physique division
- Certified Sports Nutritionist
- CEO of Kure Recovery & Wellness
- Founder of AIE Lifestyle Wear (aielifestyle.com)
- Former college and professional football player
- Master's degree in Healthcare Administration — Texas Southern University
- 100K+ social media following
- Currently competing in the 2026 season targeting:
  - **2026 Olympia Open** — Las Vegas
  - **2027 Masters Olympia** — Japan
- Coaches clients online worldwide and in-person in Houston

---

## 🎨 Brand Identity

### Colors
```css
--gold:       #C9A84C   /* Primary accent — use for headlines, borders, CTAs */
--gold-light: #E8C97A   /* Hover states */
--gold-dim:   #7a6328   /* Subtle accents, inactive borders */
--black:      #080808   /* Page background */
--dark:       #0f0f0f   /* Section background */
--dark2:      #161616   /* Card background */
--dark3:      #1f1f1f   /* Input/nested card background */
--gray:       #777      /* Muted labels */
--gray-light: #aaa      /* Body text */
--white:      #f2f2f2   /* Headlines */
```

### Typography
- **Display / Headlines:** `Bebas Neue` — all caps, wide letter-spacing (2–4px)
- **Subheadings / Labels / Nav:** `Barlow Condensed` — uppercase, tight letter-spacing (2–3px)
- **Body text:** `Barlow` — weight 300, line-height 1.7–1.8
- Google Fonts import:
```html
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@300;400;600;700&family=Barlow:wght@300;400;500&display=swap" rel="stylesheet">
```

### Design Rules
- **Always dark background** — never white or light backgrounds
- **Gold is the only accent color** — no blues, purples, greens
- **Section labels** always use the eyebrow style: small caps, gold, with a short line before the text
- **Buttons:** Either gold-filled (`background: var(--gold); color: #080808`) or gold-outline (`border: 1px solid var(--gold); color: var(--gold)`)
- **Cards** always have a left or top gold border accent
- **Photography** — always apply `filter: brightness(0.7) contrast(1.05)` to photos to keep them dark and cinematic
- **No gradients using colors other than black/dark tones + subtle gold tints**
- **Nav** is always fixed, `position: fixed`, with `backdrop-filter: blur(16px)`
- **KJ hexagon badge:** clip-path polygon hex shape, gold background, "KJ" in Bebas Neue, black text

---

## 📁 Project Structure

```
trainwithken-site/
├── CLAUDE.md              ← this file
├── index.html             ← home page
├── pages/
│   ├── about.html         ← KJ's bio, credentials, ventures
│   ├── programs.html      ← coaching plans + pricing
│   ├── apparel.html       ← AIE Lifestyle Wear
│   └── booking.html       ← booking form + location
├── css/
│   └── styles.css         ← all shared styles (CSS variables, nav, footer, utilities)
├── js/
│   └── main.js            ← nav logic, IG feed simulation, booking form handler
├── images/
│   ├── kj-hero.jpg        ← full physique shot (shirtless) — used in home hero
│   ├── kj-coaching.jpg    ← gray tee kneeling, coaching pose — used in about/programs
│   ├── kj-gym-1.jpg       ← dumbbell rack shot 1 — used in photo strips
│   └── kj-gym-2.jpg       ← dumbbell rack shot 2 — used in photo strips/booking
└── package.json           ← optional, for live-server or Vite dev setup
```

---

## 📄 Pages Overview

### `index.html` — Home
- **Hero:** Split layout — left side has headline + CTAs + stats, right side is `kj-hero.jpg` (full physique)
- **Feature strip:** 4-column bar — IFBB Pro Coach, Certified Nutritionist, Online & In-Person, InBody Analysis
- **Photo Section 1:** `kj-gym-1.jpg` left + "Maximum Muscle Protocol" stats right
- **Stats row:** 100K+, IFBB, 2026, H-TWN
- **Photo Section 2 (reversed):** `kj-gym-2.jpg` right + "The Pro Behind the Plan" bio left
- **Instagram feed:** 12-cell grid, simulated @trainwithken posts, links to instagram.com/trainwithken
- **Testimonials:** 3-column — Ced M., Scott T., Ronita P.
- **Map section:** Level One Fitness — 1803 Cleburne St, Houston TX 77004 + Google Maps embed
- **CTA banner:** "Start Your Transformation" with links to programs and booking

### `pages/about.html` — About
- Split hero: `kj-coaching.jpg` left, bio + credentials right
- Stats row: IFBB, 100K+, 2026, M.S.
- Full-width 3-photo strip: gym shots with cinematic labels
- Ventures section: TrainWithKen, AIE Lifestyle Wear, Kure Recovery

### `pages/programs.html` — Programs
- Split hero with `kj-coaching.jpg`
- 3-column pricing cards:
  - **Self-Led System** — $97 one-time
  - **Online Coaching** — $297/month (featured, most popular)
  - **VIP Elite Access** — $597/month
- Framework section: InBody, Ounce-Based Macros, Recovery, Accountability

### `pages/apparel.html` — Apparel
- Links out to aielifestyle.com (external Shopify store)
- Split hero with `kj-coaching.jpg`
- 6 product card grid with names, prices, shop buttons
- CTA banner linking to aielifestyle.com

### `pages/booking.html` — Book a Call
- Split layout: `kj-gym-2.jpg` left with "Let's Build Your Plan" overlay
- Right side: full booking form
  - Fields: Name, Email, Phone, Service, Date, Time, Goal, Source
  - Services: Discovery Call (free), Online Coaching, VIP Elite, Self-Led, In-Person, Comp Prep, Nutrition Only
  - On submit: show success message (no backend required — can wire to Formspree or Netlify Forms)

---

## 🗺️ Training Location

**Gym:** Level One Fitness
**Address:** 1803 Cleburne St, Houston TX 77004
**Google Maps Embed URL:**
```
https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3464.8!2d-95.3726!3d29.7263!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8640be6fce392e3d%3A0x1e7e4b6f7e2e4b6f!2s1803+Cleburne+St%2C+Houston%2C+TX+77004!5e0!3m2!1sen!2sus!4v1700000000
```
Map iframe filter: `filter: grayscale(90%) contrast(1.1) brightness(0.5)`

---

## 🧩 Reusable Components

### Nav
```html
<nav>
  <div class="nav-logo" onclick="...">
    <div class="nav-badge">KJ</div>  <!-- hexagon clip-path -->
    <div>
      <div class="nav-brand">TRAINWITHKEN</div>
      <div class="nav-sub">trainwithken.fit</div>
    </div>
  </div>
  <ul class="nav-links">...</ul>
  <a class="nav-cta">Start Now</a>
</nav>
```

### Section Label (eyebrow)
```html
<div class="sec-label">Label Text</div>
```
```css
.sec-label {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 10px; letter-spacing: 4px; color: var(--gold);
  text-transform: uppercase; display: flex; align-items: center; gap: 12px;
}
.sec-label::before { content: ''; width: 28px; height: 1px; background: var(--gold); }
```

### Gold Button
```html
<a class="btn-gold">View Plans</a>
```
```css
.btn-gold {
  background: var(--gold); color: var(--black);
  padding: 15px 36px; font-family: 'Bebas Neue', sans-serif;
  font-size: 15px; letter-spacing: 3px; border: none; cursor: pointer;
  text-decoration: none; display: inline-block; transition: all 0.2s;
}
```

### Outline Button
```html
<a class="btn-outline">Book a Call</a>
```

### Gold-border Card
```html
<div class="cred">
  <div class="cred-ico">🏆</div>
  <div>
    <div class="cred-t">Title Here</div>
    <div class="cred-d">Description here</div>
  </div>
</div>
```

---

## 🔗 External Links

| Destination | URL |
|---|---|
| Main website | https://trainwithken.fit |
| Apparel store | https://aielifestyle.com |
| Instagram | https://www.instagram.com/trainwithken |
| Booking platform | https://trainwithken.fit (ForActive) |
| Email | info@trainwithken.fit |

---

## 📸 Photography — Source Files & Placement

### Original Upload Filenames → Rename To

These are the 4 real photos of KJ. They were uploaded from an iPhone and need to be renamed when you drop them into `/images/`:

| Original filename | Rename to | Description |
|---|---|---|
| `36EAA32F-D616-489E-A1D9-1F10D0E575F2.png` | `kj-hero.jpg` | Shirtless full physique, black shorts, Level One Fitness floor — **main hero image** |
| `F3ACC3D5-AA02-439E-AE94-1553AC2290AC.png` | `kj-coaching.jpg` | Gray "Lift Heavy" tee, black cap, kneeling on gym floor, coaching pose |
| `IMG_6240.jpeg` | `kj-gym-1.jpg` | Black tank top, standing at dumbbell rack, graffiti mural background — face straight |
| `IMG_6235.jpeg` | `kj-gym-2.jpg` | Black tank top, standing at dumbbell rack, graffiti mural background — looking up |

### Rename command (run from your downloads or uploads folder):
```bash
cp "36EAA32F-D616-489E-A1D9-1F10D0E575F2.png" trainwithken-site/images/kj-hero.jpg
cp "F3ACC3D5-AA02-439E-AE94-1553AC2290AC.png"  trainwithken-site/images/kj-coaching.jpg
cp "IMG_6240.jpeg"                              trainwithken-site/images/kj-gym-1.jpg
cp "IMG_6235.jpeg"                              trainwithken-site/images/kj-gym-2.jpg
```

### Where Each Photo Is Used

| Image | Pages | Placement |
|---|---|---|
| `kj-hero.jpg` | `index.html` | Right half of hero split — full height, object-position top |
| `kj-coaching.jpg` | `about.html`, `programs.html`, `apparel.html` | Left panel of split hero sections |
| `kj-gym-1.jpg` | `index.html`, `about.html` | Photo section splits, 3-photo strip (slot 1) |
| `kj-gym-2.jpg` | `index.html`, `about.html`, `booking.html` | Photo section splits, 3-photo strip (slot 3), booking left panel |

### HTML Image Tag Template
```html
<!-- Always use this pattern for KJ's photos -->
<img
  src="../images/kj-hero.jpg"
  alt="KJ - IFBB Pro Men's Physique"
  style="width:100%; height:100%; object-fit:cover; object-position:center top;
         filter:brightness(0.72) contrast(1.08); display:block;"
>
```

### CSS Photo Rules
```css
/* All photo containers */
.photo-panel img,
.hero-right img,
.about-photo img,
.booking-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;   /* keeps KJ's face in frame */
  display: block;
  filter: brightness(0.72) contrast(1.08);
  transition: transform 0.5s ease;
}

/* Hover zoom */
.photo-panel:hover img,
.strip-cell:hover img {
  transform: scale(1.03);
}

/* Always add a gradient overlay div inside the photo container */
.photo-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(to right, transparent 55%, rgba(8,8,8,0.85) 100%),
    linear-gradient(to top, rgba(8,8,8,0.7) 0%, transparent 45%);
}
```

### Path Reference by Page

```
index.html          → src="images/kj-hero.jpg"
index.html          → src="images/kj-gym-1.jpg"
index.html          → src="images/kj-gym-2.jpg"
pages/about.html    → src="../images/kj-coaching.jpg"
pages/about.html    → src="../images/kj-gym-1.jpg"
pages/about.html    → src="../images/kj-gym-2.jpg"
pages/about.html    → src="../images/kj-hero.jpg"     (photo strip slot 2)
pages/programs.html → src="../images/kj-coaching.jpg"
pages/apparel.html  → src="../images/kj-coaching.jpg"
pages/booking.html  → src="../images/kj-gym-2.jpg"
```

> ⚠️ Note: `index.html` is in the root so paths are `images/filename.jpg`.
> All pages inside `/pages/` need `../images/filename.jpg` (one level up).

### Never Do This
- Never use stock photos — only KJ's 4 real images
- Never crop so KJ's face is out of frame on hero/feature placements
- Never use `object-position: center center` on portrait shots — always `center top`
- Never remove the brightness filter — images must stay dark and cinematic

---

## ⚙️ Dev Setup

### Quick local preview (no install)
```bash
python3 -m http.server 3000
# open http://localhost:3000
```

### With live reload
```bash
npm install -g live-server
live-server --port=3000
```

### With Vite (recommended for React conversion)
```bash
npm create vite@latest trainwithken-site -- --template react
cd trainwithken-site
npm install
npm run dev
```

### Deploy to Netlify (current host)
```bash
# drag and drop the folder at netlify.com/drop
# or use Netlify CLI:
npm install -g netlify-cli
netlify deploy --prod --dir=.
```

---

## 🚫 What NOT to Do

- Never use white or light backgrounds
- Never use Inter, Roboto, or Arial fonts
- Never use purple, blue, or red accents
- Never make the nav non-fixed
- Never use more than 2 button styles (gold-fill and gold-outline)
- Never add stock photography — only KJ's real photos
- Never change the gold hex value (`#C9A84C`)
- Never add a sidebar layout — always full-width sections
- Never use rounded corners on cards (sharp edges only)
- Never use drop shadows (use border accents instead)

---

## ✅ Current Status

- [x] Single-file HTML prototype built and tested
- [x] All 4 KJ photos embedded as base64 and placed correctly
- [x] All 5 pages designed: Home, About, Programs, Apparel, Booking
- [x] Map pinned to Level One Fitness — 1803 Cleburne St, Houston TX 77004
- [x] Instagram section links to @trainwithken
- [x] Booking form with service selector built
- [x] Split into separate HTML/CSS/JS files (`index.html`, `pages/`, `css/`, `js/`)
- [x] Photo source filenames documented with rename instructions
- [ ] **Drop 4 images into `/images/` folder using the rename table in the Photography section**
- [ ] Wire booking form to Formspree or Netlify Forms
- [ ] Connect real Instagram feed via Instagram Basic Display API
- [ ] Deploy to trainwithken.fit via Netlify

### 🖼️ Next immediate step — add your photos:
```bash
# Run this from wherever your downloaded photos are saved
cp "36EAA32F-D616-489E-A1D9-1F10D0E575F2.png" trainwithken-site/images/kj-hero.jpg
cp "F3ACC3D5-AA02-439E-AE94-1553AC2290AC.png"  trainwithken-site/images/kj-coaching.jpg
cp "IMG_6240.jpeg"                              trainwithken-site/images/kj-gym-1.jpg
cp "IMG_6235.jpeg"                              trainwithken-site/images/kj-gym-2.jpg
```

---

*Last updated: June 2026 | Built for KJ — IFBB Pro, Houston TX*
