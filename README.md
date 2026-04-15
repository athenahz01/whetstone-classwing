# Whetstone Classical Languages

Immersive instruction in Ancient Greek, Latin, and Biblical Hebrew — for individuals, churches, and study groups.

**Faculty:** Harvard BA + Oxford MSt. Active method. Live online via Zoom.

---

## Tech stack

- **React 18** (Vite) — single-file SPA, all styling via inline styles + CSS vars
- **Vercel** — deploy with zero config
- **Stripe Payment Links** — one URL per session, no server needed
- **Cal.com** — placement call booking

---

## Local development

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`.

---

## Configuration (before going live)

All live config is at the top of `src/App.jsx`:

### 1. Cal.com link
```js
const CAL_URL = "https://cal.com/YOUR_USERNAME/placement-call";
```
Replace with your actual Cal.com scheduling link.

### 2. Stripe Payment Links
```js
const STRIPE_LINKS = {
  g101a: "https://buy.stripe.com/...",
  g101b: "https://buy.stripe.com/...",
  // one per session id
};
```
Create a Payment Link in the Stripe Dashboard for each session. The session IDs map to the keys above — they're listed at the top of the file.

When a `STRIPE_LINKS` entry is filled, the Enroll page shows a **Pay & Enroll** button that opens Stripe. When empty, it falls back to the contact-us flow.

---

## Deploy to Vercel

```bash
npm run build          # produces /dist
vercel --prod          # or push to GitHub and connect via vercel.com
```

`vercel.json` handles SPA routing so direct links and refreshes work correctly.

---

## Pages

| Route | Page |
|-------|------|
| `home` | Homepage |
| `courses` | All courses overview |
| `lang/:id` | Language page (greek / latin / hebrew) |
| `course/:lang/:code` | Individual course detail + session enrollment |
| `schedule` | Full schedule with language tab switcher |
| `method` | Active method + faculty bios |
| `groups` | Church & group partnerships (with inquiry form) |
| `tutorials` | Private tutorial pricing |
| `enroll/:lang/:code/:session` | Checkout (Stripe or contact fallback) |
| `contact` | Contact + Cal.com placement call |

Navigation is client-side only — no URL bar changes (intentional for simplicity). To add URL routing, drop in `react-router-dom`.

---

## Pricing (as configured)

| Product | Price |
|---------|-------|
| Individual course | $895–$995 / 14-week term |
| Group — Single Cohort (6–12) | $595 / student |
| Group — Full Group (13–20) | $495 / student |
| Group — Ongoing Partnership | Custom |
| Private Tutorial — Individual | $150 / hr |
| Private Tutorial — Paired | $175 / hr total |

Church Partnership flat-rate pricing ($8,995 / $5,995 Founding) lives in outreach materials, not the public site — contact flow handles those.

---

## Content updates

All content is data-driven at the top of `src/App.jsx`:

- **`languages[]`** — courses, sessions, pricing, descriptions
- **`groupTracks[]`** — language tracks shown on the Groups page
- **`groupPackages[]`** — pricing tiers on the Groups page
- **`faculty[]`** — names, bios, credentials, and base64 photos
- **`CAL_URL`** / **`STRIPE_LINKS`** — integrations

To add a session, add an object to the relevant `sessions[]` array and add its ID to `STRIPE_LINKS`.

---

## Contact

cole@whetstoneadmissions.com · 919-599-4565
