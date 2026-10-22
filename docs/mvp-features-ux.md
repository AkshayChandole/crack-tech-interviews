# MVP Features & UI/UX

> Status: **Approved** · Last updated: 2026-10-23
>
> Defines what ships in the MVP and how it should look and feel. Content structure is defined separately in [content-model.md](content-model.md).

## Guiding principle

Our audience is **senior and staff engineers**: time-constrained and skeptical of fluff. The interface must feel fast, precise, and information-dense, and get out of the way of the content.

---

## 1. Feature scope

### 1.1 Must have (launch blockers)

| Area | Features |
|---|---|
| **Pages** | Landing · System Design hub · Lesson · Problem · Problems index · Concepts glossary + concept page · Paths index + path page · About · 404 |
| **Reading** | Three-column reading layout · Scroll-aware "On this page" TOC · Prev / next navigation · Reading progress bar · Reading time |
| **Content components** | Callouts (*Interview tip*, *Staff insight*, *Common mistake*) · Key takeaways box · Trade-off comparison tables · Code blocks with copy button |
| **Diagrams** | Static SVG diagrams with zoomable, pannable lightbox · Scenario player (play / pause / step, narration) |
| **Concept graph** | Concept hover cards · Prerequisites block at top of lessons · Related and "Referenced by" links |
| **Discovery** | ⌘K search across lessons, problems, and concepts · Problems index filters (difficulty, focus area) |
| **Platform** | Light / dark / system themes · Fully responsive reading · SEO, sitemap, generated OG images · Analytics · WCAG 2.1 AA |

### 1.2 Included in MVP (high value, no backend)

**Progress tracking without login**

- Mark lessons and problems complete; bookmark items.
- Per-module and per-path progress indicators.
- Stored in `localStorage` behind a small storage interface, so it can later sync to user accounts without changing UI code.

**"Think first" mode on problems**

- Before key solution sections, a pause prompt (e.g. *"How would you handle hot keys?"*).
- Optional progressive hints, then reveal the solution.
- Can be turned off globally by readers who just want to read.

**Per-page feedback**

- "Was this helpful?" (recorded as an analytics event).
- "Report an issue" opens a pre-filled GitHub issue for the page.

### 1.3 Explicitly out of MVP

Accounts · payments · newsletter · comments · quizzes · AI design reviewer · mock interviews · practice canvas.

---

## 2. Page layouts

### 2.1 Lesson page

```
┌──────────────────────────────────────────────────────────────────┐
│ Logo   System Design ▾   Problems   Concepts   Paths   ⌘K   ☾    │
├────────────┬───────────────────────────────────┬─────────────────┤
│ MODULES    │ Data Storage › Sharding           │ ON THIS PAGE    │
│ ▸ Framework│ Sharding & Partitioning           │ · Why it matters│
│ ▸ Founda.. │ Intermediate · Senior/Staff · 14m │ · Core idea     │
│ ▾ Data     │ ┌ Prerequisites ───────────────┐  │ · How it works  │
│   ✓ SQL vs │ │ Replication · Consistent hash│  │ · Trade-offs    │
│   ✓ Index  │ └──────────────────────────────┘  │ · In interviews │
│   ● Shard  │                                   │                 │
│     Consis │ [ diagram — click to zoom ]       │ ─────────────── │
│ ▸ Caching  │                                   │ ☐ Mark complete │
│            │ Staff insight: …                  │ ☆ Bookmark      │
│            │                                   │                 │
│            │ ← Indexing         Consistent →   │                 │
└────────────┴───────────────────────────────────┴─────────────────┘
```

- **Left:** module tree with completion state (✓ done, ● current).
- **Center:** breadcrumb, title, metadata, prerequisites, content, prev / next.
- **Right:** scroll-aware TOC and progress actions.
- **Mobile:** both sidebars collapse into drawers; TOC becomes a sticky "On this page ▾" control.

### 2.2 Problem page

Same shell as the lesson page, with:

- **Right rail:** the 12 required sections presented as an **interview timeline** (e.g. "0–5 min · Requirements"), so readers internalize pacing, not just content.
- **Senior vs. staff** section rendered as a side-by-side comparison.
- **Think-first** prompts inline before key sections.

### 2.3 System Design hub

- Module cards with lesson count and local progress.
- Featured path.
- Problems grid with difficulty and focus areas.

### 2.4 Landing page

- Sharp value proposition aimed at senior / staff engineers.
- **Hero is a live scenario animation**: show the product, don't describe it.
- Curriculum overview, sample problems, call to action.
- No stock imagery.

---

## 3. Visual design

### 3.1 Tone

A premium engineering notebook: calm, precise, high-contrast typography, generous whitespace in the reading column, dense and scannable side rails.

### 3.2 Color

- Neutral base: Tailwind **zinc** scale.
- **One accent color**, used sparingly: links, active states, focus rings, and the animated request "packet" in scenarios.
- **Diagram semantic palette:** each component type has one fixed color across all static diagrams and scenarios, so readers learn the visual language once.

| Component | Role in palette |
|---|---|
| Client / user | Neutral slate |
| Service / compute | Blue |
| Database / storage | Violet |
| Cache | Rose |
| Queue / stream | Amber |
| External system | Gray, dashed border |
| Active flow / highlight | Brand accent |

All palette colors must meet contrast requirements in both light and dark themes. Exact values are defined with the design tokens.

### 3.3 Typography

- **Geist Sans** for UI and body; **Geist Mono** for code, numbers, and estimates.
- Reading column ~70 characters wide, 17–18px body text.

### 3.4 Motion

- Motion conveys meaning (scenarios, state changes), never decoration.
- Minimal page transitions.
- Full `prefers-reduced-motion` support: scenarios fall back to step-by-step static frames.

### 3.5 Theme

Defaults to the system theme. Every diagram and scenario is designed for both light and dark from day one.

---

## 4. Brand direction

**Selected: Circuit (teal).** Engineered, calm, with a "green means passing" feel.

| | Value | Use |
|---|---|---|
| Accent | Teal 500 `#14B8A6` | Links and accents in dark theme, active flow in diagrams |
| Accent strong | Teal 600 `#0D9488` | Primary buttons, links in light theme |
| Accent subtle | Teal 100 `#CCFBF1` / Teal 800 `#115E59` | Tinted badges and highlights (background / text) |

Final values, including dark-theme variants, are verified for WCAG AA contrast when the design tokens are implemented.

**Why teal:** it's distinct from competitors' blues, purples, and oranges, and it doesn't collide with any color in the diagram palette.

**Alternatives considered:** *Signal* (indigo) was common in developer tools and too close to the database violet; *Ember* (amber) was close to LeetCode and collided with the queue color.

**Wordmark:** "CrackTechInterviews" set in Geist, with "Crack" in the accent color. A compact monogram for the favicon and small sizes will be designed alongside the design tokens.

---

## 5. Accessibility & performance targets

- WCAG 2.1 AA: contrast, keyboard navigation (including diagram lightbox and scenario controls), visible focus, screen-reader labels, required diagram alt text.
- Core Web Vitals in the "good" range on lesson pages (LCP < 2.5s, CLS < 0.1, INP < 200ms).
- Lesson pages ship minimal client JavaScript; interactive components load only where used.
