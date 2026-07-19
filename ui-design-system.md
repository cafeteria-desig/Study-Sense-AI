# StudySense AI — UI Design System Rules
Workspace rules for the Antigravity agent. Save this file at `.agent/rules/ui-design-system.md`
(or split it into `.agent/rules/01-tokens.md`, `02-components.md`, `03-supabase.md` if you prefer
narrower scoping — Antigravity loads every file in that folder).

Reference implementation: unzip `optimus-the-ai-platform-to-build-and-ship.zip` into
`reference/optimus-ui/` at the project root. That folder is the **visual ground truth**. It is
**read-only** — never edit it, never ship it, never `import` its components directly (it's a
Next.js/Tailwind-v4 codebase; this project targets React + Vite). Copy the *patterns*, not the files.

---

## 0. Priority

This file **overrides** the `# Design Style` section of `PROJECT_PLAN.md` — specifically the
`#4F46E5` indigo/blue theme is replaced by the monochrome system below. Every other requirement in
`PROJECT_PLAN.md` (pages, features, API routes, phases) stays in effect **except** the database
layer, which is replaced per §8. If anything in `PROJECT_PLAN.md` conflicts with this file on
visual design, this file wins.

---

## 1. Tech stack (non‑negotiable)

| Layer | Choice |
|---|---|
| Frontend | React 18 + Vite + TypeScript + React Router |
| Styling | Tailwind CSS **v4** (CSS-first config, `@theme inline`, no `tailwind.config.js` content scanning) |
| Components | shadcn/ui, style = `new-york`, base color = `neutral` |
| Primitives | Radix UI (via shadcn) |
| Motion | Framer Motion |
| Icons | `lucide-react` only — no emoji, no icon fonts, no other icon packs |
| Markdown | `react-markdown` + `rehype-highlight` or `shiki` for code blocks |
| Backend | Node.js + Express (unchanged) |
| Database + Auth | **Supabase** (Postgres + RLS + Supabase Auth) — replaces MongoDB entirely |
| AI | OpenAI/Anthropic via backend proxy, SSE streaming (unchanged) |
| Deploy | Docker + AWS App Runner (unchanged) |

**Never** add `mongoose`, `mongodb`, or any Mongo driver to `package.json`. Never add a UI kit
other than shadcn/ui (no MUI, no Chakra, no Ant Design, no Bootstrap).

---

## 2. Design tokens — copy exactly

Put this in `frontend/src/index.css` (Tailwind v4 entry point):

```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

:root {
  --background: oklch(0.985 0.002 90);
  --foreground: oklch(0.12 0.01 60);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.12 0.01 60);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.12 0.01 60);
  --primary: oklch(0.12 0.01 60);
  --primary-foreground: oklch(0.985 0.002 90);
  --secondary: oklch(0.96 0.005 90);
  --secondary-foreground: oklch(0.12 0.01 60);
  --muted: oklch(0.94 0.005 90);
  --muted-foreground: oklch(0.45 0.02 60);
  --accent: oklch(0.92 0.01 90);
  --accent-foreground: oklch(0.12 0.01 60);
  --destructive: oklch(0.577 0.245 27.325);
  --destructive-foreground: oklch(0.985 0.002 90);
  --positive: oklch(0.62 0.15 145);
  --positive-foreground: oklch(0.985 0.002 90);
  --border: oklch(0.88 0.01 90);
  --input: oklch(0.92 0.01 90);
  --ring: oklch(0.12 0.01 60);
  --radius: 0.25rem;
}

.dark {
  --background: oklch(0.14 0.005 60);
  --foreground: oklch(0.96 0.002 90);
  --card: oklch(0.18 0.005 60);
  --card-foreground: oklch(0.96 0.002 90);
  --popover: oklch(0.18 0.005 60);
  --popover-foreground: oklch(0.96 0.002 90);
  --primary: oklch(0.96 0.002 90);
  --primary-foreground: oklch(0.14 0.005 60);
  --secondary: oklch(0.22 0.005 60);
  --secondary-foreground: oklch(0.96 0.002 90);
  --muted: oklch(0.2 0.005 60);
  --muted-foreground: oklch(0.65 0.01 60);
  --accent: oklch(0.24 0.008 90);
  --accent-foreground: oklch(0.96 0.002 90);
  --destructive: oklch(0.65 0.22 27);
  --destructive-foreground: oklch(0.14 0.005 60);
  --positive: oklch(0.7 0.15 145);
  --positive-foreground: oklch(0.14 0.005 60);
  --border: oklch(0.28 0.01 90);
  --input: oklch(0.24 0.01 90);
  --ring: oklch(0.96 0.002 90);
}

@theme inline {
  --font-sans: var(--font-instrument), "Instrument Sans", system-ui, sans-serif;
  --font-mono: var(--font-jetbrains), "JetBrains Mono", monospace;
  --font-display: var(--font-instrument-serif), "Instrument Serif", Georgia, serif;
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-positive: var(--positive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}

@layer base {
  * { @apply border-border outline-ring/50; }
  body { @apply bg-background text-foreground; }
  html { scroll-behavior: smooth; }
}
```

`--positive` and its dark-mode value are **additions** to the reference (used for "correct answer" /
streak states in the Quiz and Study Planner — see §5). Everything else is copied verbatim from the
reference. The `.dark` block is also an addition (the reference doesn't ship one); keep the same
low-chroma neutral hue (60/90) so light and dark feel like the same product.

Fonts (Google Fonts, load via `@fontsource` or a `<link>` in `index.html` since this is Vite, not
Next.js `next/font`):
- **Instrument Sans** → `--font-instrument` → body text, UI chrome
- **Instrument Serif**, weight 400 only → `--font-instrument-serif` → all headings (`font-display`)
- **JetBrains Mono** → `--font-jetbrains` → labels, timestamps, numbers, code

---

## 3. Typography rules

- Every `h1`–`h3` uses `font-display` (Instrument Serif). **Never** use the sans font for a page or
  section heading.
- Body copy, buttons, form fields, nav: `font-sans` (Instrument Sans).
- Anything that is a label, an eyebrow, a timestamp, a step number, a stat, or code: `font-mono`
  (JetBrains Mono).
- Hero-scale headings use fluid sizing: `text-[clamp(2.5rem,8vw,6rem)] leading-[0.95] tracking-tight`.
  Never use a fixed `text-6xl` for a hero — it must scale with viewport.
- Do not use bold/black weights on the serif display font — it's designed at regular weight; use
  size and spacing for hierarchy, not weight.

---

## 4. Color usage rules

- The interface is **monochrome-first**. `background` / `foreground` / `muted` / `border` do ~90%
  of the visual work. Color is not the default communication tool — contrast, spacing, and type
  scale are.
- Exactly two semantic accents exist: `destructive` (errors, incorrect quiz answers, delete
  actions) and `positive` (correct quiz answers, completed study-plan tasks, success toasts). Do
  not invent additional accent colors.
- **Never** use an indigo/violet/blue gradient, a glow/blur "AI aura" effect, or a purple-to-pink
  gradient text treatment. This is the single most common way an agent will make this look like a
  generic AI SaaS template — actively avoid it.
- No gradients on buttons or cards, period. Solid `foreground`/`background` fills only.

---

## 5. Signature UI motifs (reuse across every screen)

**Eyebrow label** — put above every section heading and every tool page's title:
```tsx
<span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground">
  <span className="w-8 h-px bg-foreground/30" />
  NOTES GENERATOR
</span>
```

**Numbered rows, not icon-in-a-box grids**, for any explanatory list (landing page features, exam
tips, revision points, common mistakes): a `font-mono` two-digit number (`01`, `02`…), a hairline
`border-b border-foreground/10` divider, generous vertical padding (`py-12 lg:py-20`). This is the
reference's core motif — do not substitute a 3-column icon-card grid for it.

**Hairline borders, minimal shadow** — `border-foreground/10` everywhere; `shadow-xs` only on
floating/glass surfaces (nav, dropdowns, modals). No `shadow-lg`/`shadow-xl`/`shadow-2xl` anywhere.

**Radius contrast is intentional**: primary CTA buttons are `rounded-full` (pill). Cards, inputs,
textareas, and chat bubbles use the token radius (`rounded-md`, ~4px — sharp, not soft). The one
sanctioned exception is the Dashboard tool grid (§7), which may use `rounded-lg` for easier tap
targets.

**Glass, shrinking nav on scroll**: fixed header, transparent + full-width at scroll-top,
transitions to `bg-background/80 backdrop-blur-xl border border-foreground/10 rounded-2xl` with
inset margin and a shorter height once scrolled. Reuse this exact pattern for the in-app top bar,
not just the marketing nav.

**Scroll-reveal**: every landing-page section and every dashboard card animates in once via
`IntersectionObserver` or Framer Motion `whileInView` — `opacity 0→1`, `translate-y 16px→0`,
`duration 500–700ms`, children staggered 75–100ms apart. Do not animate on every re-render, only on
first intersection.

**Grid-line background overlay** (8 horizontal + 12 vertical hairlines at ~10% opacity) is allowed
only on the landing hero and empty/onboarding states — never inside data-dense dashboard or tool
screens, it will fight with real content there.

**Marquee** for landing-page stats/testimonials only. **Noise overlay** (`opacity: 0.03` SVG
fractal-noise texture) at most once or twice per page, on hero/CTA sections — not on every card.

---

## 6. Motion rules

- Use Framer Motion (`whileInView`, `AnimatePresence`) with the reference's timing: entrance
  transitions 500–700ms, `ease: [0.22, 1, 0.36, 1]`-style easing; hover-lift is
  `translateY(-4px)` with a springy `cubic-bezier(0.34, 1.56, 0.64, 1)`.
- Respect `prefers-reduced-motion`: disable marquee scroll and character-by-character text
  animation for those users; keep simple opacity fades only.
- Streaming AI responses in the Tutor/Notes/Quiz screens: a blinking block cursor (`▍`) at the end
  of in-progress text, no bouncing-dots loader.

---

## 7. Page-by-page application

Map the reference's marketing-site patterns onto `PROJECT_PLAN.md`'s actual pages:

- **Landing Page** — Hero with fluid serif headline and a rotating word (swap the reference's
  "create/build/scale/ship" for `["learn", "revise", "master", "ace"]`), features as numbered rows
  (§5), How-it-Works, testimonials marquee, CTA, footer with a hairline top divider.
- **Login / Register** — centered card, sharp radius, hairline border, no illustration clutter,
  mono micro-copy for helper text. Wire to Supabase Auth (§8), not hand-rolled JWT forms.
- **Dashboard** — the *one* place a card grid replaces numbered rows, because it needs to be
  scannable at a glance. Each tool card: `lucide-react` icon (20px, `currentColor`, no background
  chip), `font-sans font-medium` title, one-line `text-muted-foreground` description, hairline
  border, `hover-lift`. `rounded-lg` permitted here (see §5).
- **AI Tutor** — ChatGPT-style two-pane layout. Sidebar: chat history list, sharp radius, hairline
  row dividers, `font-mono text-xs` timestamps. Message area: no bubble shadows, just a subtle
  `bg-muted` tint on AI messages and `bg-transparent` on user messages, `rounded-md`. Ghost-icon
  copy button appears on hover in the top-right of each AI message. Code blocks use
  `font-mono` (JetBrains Mono) with syntax highlighting.
- **Notes / Quiz / Study Planner / PDF Summarizer / Programming Helper / Flashcards** — consistent
  two-column "input panel | result panel" layout on desktop, stacking on mobile. Eyebrow label
  (§5) above each panel. Results that are list-like (exam tips, common mistakes, revision points)
  use the numbered-row motif. Primary "Generate" action is a pill button; secondary actions
  (Copy / Download PDF / Save / Shuffle) are ghost or outline buttons, never a second pill.
  - Quiz: correct/incorrect states use `positive`/`destructive` tokens only — no colored
    background wash on the whole question, just the answer chip.
  - Flashcards: 3D flip via CSS `transform-style: preserve-3d`, `rounded-md`, hairline border,
    front = question in `font-display`, back = answer in `font-sans`.
- **Settings** — plain stacked sections with hairline dividers; no cards needed here.

---

## 8. Supabase integration rules (replaces PROJECT_PLAN's MongoDB section)

- One Supabase project. RLS **must** be enabled on every table, policy `auth.uid() = user_id` for
  select/insert/update/delete. No table is ever left with RLS disabled.
- Auth: use **Supabase Auth** (email/password to start) instead of hand-rolled JWT signing. Express
  protected routes verify the Supabase-issued access token server-side using the Supabase server
  client — don't reimplement token signing/verification.
- Client SDK: `@supabase/supabase-js` v2. One singleton browser client at
  `frontend/src/services/supabaseClient.ts` (uses the **anon** key only). A separate server-side
  client in `backend/config/supabase.js` (uses the **service role** key, backend-only, never sent
  to the browser).
- Storage: a private `pdf-uploads` bucket for the PDF Summarizer, one folder per user
  (`{user_id}/...`), accessed only via short-lived signed URLs — never a public bucket.
- Env vars: `SUPABASE_URL`, `SUPABASE_ANON_KEY` in both frontend (`VITE_` prefixed) and backend;
  `SUPABASE_SERVICE_ROLE_KEY` in backend only, **never** prefixed with `VITE_`, never referenced
  from any frontend file.

Minimal schema (adjust column details as features are built out, but keep this table set and RLS
pattern):

```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz default now()
);

create table chat_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role text not null check (role in ('user','assistant')),
  content text not null,
  created_at timestamptz default now()
);

create table notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  topic text not null,
  content jsonb not null,
  created_at timestamptz default now()
);

create table quizzes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  topic text not null,
  difficulty text not null,
  questions jsonb not null,
  score int,
  created_at timestamptz default now()
);

create table flashcards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  topic text not null,
  cards jsonb not null,
  created_at timestamptz default now()
);

create table study_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  exam_date date not null,
  plan jsonb not null,
  created_at timestamptz default now()
);

-- repeat for every table:
alter table chat_history enable row level security;
create policy "owner access" on chat_history
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

---

## 9. Explicit forbidden list

- ❌ Default shadcn indigo/violet theme, or any color from `PROJECT_PLAN.md`'s original `#4F46E5` /
  `#6366F1` palette.
- ❌ Purple-to-blue gradients on text, buttons, or backgrounds.
- ❌ Emoji used as icons anywhere in the product UI.
- ❌ `shadow-lg` / `shadow-xl` / `shadow-2xl`.
- ❌ `mongoose`, `mongodb`, or any Mongo package in `package.json`.
- ❌ `SUPABASE_SERVICE_ROLE_KEY` or any LLM API key referenced in frontend code or `VITE_`-prefixed
  env vars.
- ❌ Placeholder/lorem-ipsum copy in the final build — write real StudySense AI microcopy.
- ❌ Stock "abstract 3D gradient blob" hero images. If a hero visual is wanted, build it as
  `currentColor` line-art SVG (with native `<animate>` tags) or a monochrome Three.js scene, matching
  the reference's `animated-sphere` / `animated-tetrahedron` approach.

---

## 10. Accessibility & responsiveness

- Maintain WCAG AA contrast for `muted-foreground` against `background` in both light and dark
  mode — verify after any token tweak.
- Every custom animation needs a `prefers-reduced-motion` fallback (see §6).
- Breakpoints match the reference: base (mobile) / `md` 768px / `lg` 1024px / content max-width
  `1400px` container with `px-6 lg:px-12` gutters.
- All interactive elements are keyboard-navigable with a visible `focus-visible` ring using the
  `--ring` token (shadcn's `Button` already does this — don't strip it).

---

## 11. Where things live

- This file → `.agent/rules/ui-design-system.md`.
- Reference product → unzip to `reference/optimus-ui/`, add it to `.gitignore`, treat as read-only.
- Design tokens → `frontend/src/index.css` (§2).
- Supabase clients → `frontend/src/services/supabaseClient.ts` and `backend/config/supabase.js`
  (§8).
