# TradeStickerCollectors — Project Notes

A running resume of everything wired up for the PANINI / StickerSwap project,
so you can pick it up from any computer without re-deriving the deployment
setup.

---

## 1. What this is

A static web app for Panini-style sticker album collectors. All data
(albums, friends, chats, sticker images, user accounts) lives in the
browser's `localStorage` — no backend yet. This means each browser is
its own little world, but it's enough for an MVP that you can show to
collectors.

**Live URL (target):** `https://tradestickercollectors.ganabingoperu.com`
**DO preview URL:** `https://walrus-app-j4xak.ondigitalocean.app/`

---

## 2. Local files

| File | Purpose |
|---|---|
| `index.html` | Main app shell — home / albums / friends / chat / account views |
| `app.js` | All app logic — state, rendering, spread/grid views, chat, friend search, page turn animation |
| `auth.js` | Login/signup/forgot/reset + admin dashboard logic |
| `admin.html` | Admin dashboard — manage users, album catalog, sticker images |
| `login.html`, `signup.html`, `forgot-password.html`, `reset-password.html` | Auth pages |
| `styles.css` | Whole theme — navy + gold tokens, panels, page-turn animation, everything |
| `spreadalbum.png`, `spreadalbum1.png` | Album spread background art (used by `.catalogue-page`) |
| `background.png` | Body background photo |
| `assets/*.png` | Misc sticker artwork |
| `.gitignore` | Ignores OS junk, editor folders, `.env`, etc. |

---

## 3. GitHub

- **Owner:** `jorgerensoraji`
- **Repo:** `TradeStickerCollectors`
- **URL:** https://github.com/jorgerensoraji/TradeStickerCollectors
- **Default branch:** `main`
- **Auth method:** SSH (key `id_ed25519` named `benito-office-pc` added at
  https://github.com/settings/keys)
- **Remote URL in git:** `git@github.com:jorgerensoraji/TradeStickerCollectors.git`

### Cloning on a fresh computer

```powershell
# 1. Make sure you have git + an SSH key registered on your GitHub account
ssh -T git@github.com         # should say "Hi jorgerensoraji!"

# 2. Clone
git clone git@github.com:jorgerensoraji/TradeStickerCollectors.git
cd TradeStickerCollectors

# 3. Set local git identity (one time per clone)
git config --local user.name "jorgerensoraji"
git config --local user.email "YOUR-GITHUB-EMAIL"
```

If you don't have an SSH key on the new computer:
1. `ssh-keygen -t ed25519 -C "your-label"` → save to default location
2. Copy `~/.ssh/id_ed25519.pub` content
3. Paste into https://github.com/settings/keys → **New SSH key**

---

## 4. DigitalOcean App Platform

- **Account:** same DigitalOcean account that runs `ganabingoperu.com`
- **Product used:** App Platform → Static Site tier (**$0/month**)
- **App name:** auto-generated → URL is `https://walrus-app-j4xak.ondigitalocean.app/`
- **Source:** GitHub → `jorgerensoraji/TradeStickerCollectors` → `main` branch
- **Autodeploy:** ON (every `git push origin main` triggers a build)
- **Build settings:**
  - Source directory: `/`
  - Build command: *(empty)*
  - Output directory: *(empty)*

### Recreating the app from scratch

1. https://cloud.digitalocean.com/apps → **Create App**
2. Source: GitHub → authorize → pick `jorgerensoraji/TradeStickerCollectors`
3. Branch: `main`, Autodeploy ON
4. Resource type: **Static Site** (DO auto-detects)
5. Source directory `/`, leave build command/output empty
6. Plan: **Starter (Free)**
7. Pick a region
8. **Create Resources**

---

## 5. DNS / Namecheap

- **Registrar:** Namecheap
- **Main domain:** `ganabingoperu.com` (this is the existing bingo site — left untouched)
- **Subdomain for this app:** `tradestickercollectors.ganabingoperu.com`
- **Record at Namecheap → Advanced DNS → Host Records:**

  | Type | Host | Value | TTL |
  |---|---|---|---|
  | `CNAME Record` | `tradestickercollectors` | `walrus-app-j4xak.ondigitalocean.app` | Automatic |

- **HTTPS:** DO provisions Let's Encrypt automatically once DNS resolves.
  Verify with `nslookup tradestickercollectors.ganabingoperu.com`.

---

## 6. Daily workflow — making a change live

```powershell
# 1. Edit files locally
# 2. Stage, commit, push
git add app.js styles.css   # or specific files
git commit -m "Short description of the change"
git push origin main
```

That's it — within ~2 min DO redeploys and the live site updates.

---

## 7. Defaults / built-in accounts

Seeded admin (created automatically on first load if missing):

- **Email:** `admin@stickerswap.local`
- **Password:** `admin123`
- **Role:** admin

⚠️ This password is hardcoded in `auth.js` and `app.js` (the seed
record). For a real launch, change it after first login.

Collector accounts: created via `signup.html` or in the admin
dashboard.

---

## 8. Browser storage layout

All keys are under the `stickerswap.mvp.` namespace in `localStorage`:

| Key | Holds |
|---|---|
| `stickerswap.mvp.users` | Registered user accounts |
| `stickerswap.mvp.session` | Current logged-in user id |
| `stickerswap.mvp.resetTokens` | Password reset tokens |
| `stickerswap.mvp.stickerCatalog` | Admin-uploaded sticker images (base64 data URLs) |
| `stickerswap.mvp.albumCatalog` | Admin-curated album templates |
| `stickerswap.mvp.state` | Per-device state: albums, friends, posts, chat messages |

### Resetting local state during dev

DevTools (F12) → **Application** → **Local Storage** → site origin
→ delete a specific key or right-click → **Clear**.

---

## 9. Known limitations / gotchas

- **localStorage cap (~5 MB)** — sticker images uploaded by admin are
  stored as base64 data URLs. ~5 images of 1 MB each fills it. Upload
  form now caps at 800 KB and surfaces a clear error when storage is full.
- **One device = one world** — friends/albums/chats are per-browser, not
  truly per-user. Two collectors sharing a device would see each other's
  data. Fix later by moving to a real backend or scoping
  `STORAGE_KEY` by user id.
- **Crypto.randomUUID()** requires HTTPS or localhost — works on the DO
  domain since it's HTTPS.
- **Sticker images = base64** — the right long-term fix is hosting
  images on DO Spaces and storing only URLs in localStorage.

---

## 10. What's been built so far (feature timeline)

**App basics**
- Navigation between Home, Albums, Friends, Chat, Account; admin link
- Login / Signup / Forgot / Reset password flows (localStorage-backed)
- Admin dashboard: user management, album catalog management, sticker
  image upload

**Album spreads**
- World Cup 2026 layout: 1 cover sticker + 19 FIFA Museum / FWC
  stickers + 48 team spreads of 20 stickers each
- Opening section split into **4 intro spreads** mirroring the real
  Panini layout:
  - Spread 1: page 1 (#00 cover horizontal) + page 2 (FWC1–FWC4 in 2×2)
  - Spread 2: page 3 (FWC5–FWC8) + page 4 (FWC9–FWC11)
  - Spread 3: page 5 (FWC12–FWC14) + page 6 (FWC15–FWC17)
  - Spread 4: page 7 (FWC18–FWC19) + blank
- Each spread has explicit `leftSlots` / `rightSlots` configs; slot
  positions auto-adapt for 1, 2, 3, 4, or 10 stickers per page
- Team spreads: 10 portrait stickers per page (badge/photo special
  layouts TBD)
- Sticker #00 (number 1) renders as a horizontal cover-sticker
  (`.cover-sticker` class) in both grid and spread views
- Page headers show team-local codes (`MEX1-MEX10` / `MEX11-MEX20`),
  not the global album numbers
- Spread dropdown labels intro spreads by name and teams as
  `01 Mexico (MEX1-MEX20)` …
- Realistic page-turn animation with 7-stop arc, paper-curl shading,
  travelling sheen, cast shadow
- Underlying destination page stays on the OLD content until ~82 % of
  the turn — swap happens under cover of the rotating sheet's back face

**Stickers**
- Grid + spread views share the same sticker dialog (mark owned, add
  duplicate, remove duplicate, clear duplicates, mark missing, choose
  variant color)
- Quick Add: comma-separated numbers
- Sticker labels (code + number) auto-hide when an uploaded image is
  showing; reappear on hover/focus
- Search box for stickers by number, code, or team

**Albums**
- Admin curates an album catalog (`stickerswap.mvp.albumCatalog`)
- Users **can't create custom albums** — they only pick from the
  admin's catalog via the "+ Album" button → picker dialog
- Default seeded album: "World Cup 2026" (980 stickers)
- Users see "Added" badge on albums already in their collection

**Friends**
- Search box queries registered users by name / email / city
- Excludes self, admins, disabled accounts, and existing friends
- Remove button per friend with a confirm prompt
- No more seeded "Ana Lima" / "Marco C." placeholders

**Guest experience**
- Without a login: only the home view shows, with a welcome panel and
  Login / Create-account CTAs
- Public post feed shown read-only
- All user-specific features (albums, friends, chat, account,
  messenger rail, "+ Album" button, post composer) are hidden until
  the user signs in
- `switchView` and `addPost` defensively refuse to operate without a
  session

**Theme**
- Navy + gold premium palette: `#0a1628` background, gold `#fbb040`
  accent
- Pure white text for AAA contrast on dark navy
- All hover/focus states refined; brand-tinted shadows
- Inputs, buttons, panels share a token system (`--radius`, `--shadow`,
  `--line`, `--brand`, etc.)

---

## 11. Useful commands

```powershell
# See changes since last push
git status --short
git diff --stat

# Push current main
git push origin main

# Run the app locally (no server needed)
start index.html       # opens in default browser

# Force a redeploy on DO without code changes
# DO App dashboard → Deployments → Deploy
```

---

## 12. Roadmap / TODO ideas

- Mark the team-photo sticker (#13 of each team) as horizontal `.cover-sticker` on the right page
- Special "team badge" treatment for sticker #1 of each team (square / different shape)
- Move sticker images off localStorage onto a real CDN (DO Spaces)
- Scope state per user (`STORAGE_KEY` namespaced by user id)
- Real backend (Firebase / Supabase) so friends/chats are cross-device

---

_Last updated: keep this file in sync as the project evolves._
