# Lumen Web design specification

Status: Phase 1 planning; approved direction, no UI implemented. Product truth is defined in [PRODUCT.md](PRODUCT.md). Build constraints are in [ARCHITECTURE.md](ARCHITECTURE.md).

## Direction and research

Hybrid product + documentation, minimal, light-first, editorial and technically explicit. Typography, spacing and real examples carry the identity. Use a Lumen text wordmark until a separate identity decision; do not invent a logo project.

UI/UX Pro Max was read at `.agents/skills/ui-ux-pro-max/SKILL.md`. Research used its CLI without persistence:

```text
"developer API documentation minimal" --design-system -p "Lumen Web"
"keyboard navigation focus search" --domain ux
"sidebar navigation deep links" --domain ux
"documentation semantic navigation" --stack react
```

The generated minimal/Swiss style suits the brief. Its FAQ/support landing pattern, dark-first palette, green CTA, and JetBrains Mono/IBM Plex pairing were rejected in favor of product explanation, light-first neutrals, restrained blue and Geist. An initial `web` navigation search returned native-app advice; the focused `ux` retry supplied applicable deep-link and skip-link guidance. Do not use the native bottom-tab recommendations here. Do not adopt positive tabindex ordering or mandatory smooth scrolling from simplistic examples; use DOM order and honor motion preferences.

Reference principles, not copied layouts: [Linear](https://linear.app/) for product hierarchy, [Vercel](https://vercel.com/) for technical framing, [shadcn/ui](https://ui.shadcn.com/) for composable controls, [Tailwind documentation](https://tailwindcss.com/docs/) for task navigation, [Stripe documentation](https://docs.stripe.com/) for integration-first content. These are qualitative references, not a claim of pixel-level visual auditing.

No gradients, glowing objects, glass panels, decorative backgrounds, emoji icons, fake metrics, testimonials, autoplay hero video or animated headings. Every diagram conveys actual behavior. Favor dividers and aligned text over rounded feature grids.

## Typography and tokens

Self-host approved Geist Sans and Geist Mono font files after checking distribution/license. Use system sans and monospace fallbacks. Preload only the critical sans font; use `font-display: swap` and metric-aware fallback selection. Do not add a font package without justification and approval.

| Role | Desktop | Mobile | Weight / line height |
| --- | --- | --- | --- |
| Hero | 64px, maximum 68px | 38px at narrow widths, up to 44px | 600 / 1.08 |
| Article title | 40px | 32px | 600 / 1.18 |
| Section heading | 36px | 28px | 600 / 1.2 |
| Article h2 | 28px | 26px | 600 / 1.3 |
| Article h3 | 21px | 20px | 600 / 1.4 |
| Prose | 17px | 16px | 400 / 1.7 |
| Interface | 14–16px | 16px for input text | 400–500 / 1.5 |
| Code | 14px | 14px | 400 / 1.65 |
| Technical label | 12–13px | 12–13px | 500 / 1.5 |

Use rem equivalents in implementation; fluid sizes must remain readable with zoom. Hero tracking approximately -0.035em, headings -0.02em, body normal. No all-caps paragraphs. One h1 per page and sequential heading structure. Keep prose at roughly 68–75 characters per desktop line.

| Semantic color | Light | Dark |
| --- | --- | --- |
| Background | `#FAFAF9` | `#111113` |
| Surface | `#FFFFFF` | `#18181B` |
| Muted surface | `#F4F4F5` | `#202023` |
| Primary text | `#18181B` | `#FAFAFA` |
| Secondary text | `#52525B` | `#A1A1AA` |
| Decorative divider | `#E4E4E7` | `#303036` |
| Control boundary | `#71717A` | `#71717A` |
| Accent / link / focus | `#1D4ED8` | `#93C5FD` |
| On accent fill | `#FFFFFF` | `#111113` |
| Success text | `#166534` | `#86EFAC` |
| Caution text | `#92400E` | `#FCD34D` |
| Error text | `#B91C1C` | `#FCA5A5` |

Candidate pairs require measured contrast before approval of implemented UI: normal text 4.5:1; large text, meaningful graphics and control indicators 3:1. Decorative dividers cannot serve as the sole control boundary. Semantic statuses include words/icons, never color alone. Syntax highlighting may use additional functional colors, checked in both themes.

Spacing tokens: 4, 8, 12, 16, 24, 32, 48, 64, 80, 96, 112px. Radius: 4px small controls, 6px buttons/code, 8px dialogs. Borders: 1px. Shadows: none for normal sections; one subtle overlay elevation. Layers: content 0, sticky navigation 20, drawer/dialog 40, transient feedback 50. Store primitives, semantic roles and component mappings centrally; components consume semantic tokens.

## Concrete page layouts

Breakpoints: small 640px, medium 768px, large 1024px, wide 1280px. Verify at 320, 375, 768, 1024 and 1440px plus zoom and landscape; breakpoints describe layout changes, not device detection.

| Area | Desktop | Mobile |
| --- | --- | --- |
| Global header | 64px high; wordmark left; Product, Documentation, GitHub and theme right | 56px; wordmark left; menu trigger right; docs search trigger where relevant |
| Landing container | 1200px max; 32px gutters, centered | 20px gutters, reducing to 16px at 320px |
| Hero at ≥1024px | 12-column grid, text 5 columns and technical illustration 7; 48px gap | Single column: heading, explanation, CTAs, illustration; no horizontal overflow |
| Sections | 96–112px vertical separation; editorial text/diagram split | 64px separation; copy before illustration |
| Docs shell at ≥1280px | 1440px max; 248px left navigation, flexible article capped near 740px, 200px contents; 24–32px gaps | Single article with navigation drawer and collapsed “On this page” disclosure |
| Docs at 1024–1279px | Left navigation plus article; contents becomes article-top disclosure | At <1024px, left sidebar becomes drawer |
| Footer | Aligned link groups and status/license line | Stacked groups with comfortable tap areas |

Use fluid columns rather than fixed widths that force overflow. Article images/diagrams scale; wide code and tables have contained, labeled scrolling regions. Reserve header space and heading scroll margins. Prefer sticky sidebar regions over independently scrolling the entire interface; long sidebars may scroll within the available viewport without trapping keyboard users.

## Landing-page section specifications

1. **Navigation:** Product links to a real landing section, Documentation opens the introduction, GitHub links to the backend. On inner pages, Product includes the landing pathname and section anchor. Wordmark returns to site root under the configured base.
2. **Hero:** one clear product statement, a two-sentence maximum explanation, visible early-development link, Get Started primary button and GitHub secondary link. No unsupported performance promise. Keep the processing illustration static until the user starts it.
3. **Pipeline:** expand the hero's explanation into registration, upload validation, durable dispatch, worker operations and outputs. Reuse the same diagram vocabulary; avoid a second competing animated centerpiece.
4. **Capabilities:** three editorial rows: ingest MP4, extract metadata/generate thumbnails, retrieve asset and output state. Explain internal metadata persistence. Separate local transcoding with an “In development — local working tree” label if included before baseline promotion.
5. **Developer experience:** source-checked registration request and corresponding response structure, with request/response labels. Display token/ID substitutions as illustrative values. No Run request button or API-key input.
6. **Architecture:** PostgreSQL as state source, outbox publisher, Redis/BullMQ, workers, FFmpeg/FFprobe and local storage; diagram plus accessible ordered explanation. Clarify that the developer operates these services.
7. **Getting started:** short prerequisites and links to full installation/first-request guides. Do not present an incomplete credential setup as a working quickstart.
8. **Footer:** documentation, repositories, status, contribution guidance, qualified license wording from PRODUCT.md. Do not invent a hosted service, support channel or release policy.

## Navigation and controls

Mobile global navigation is a menu button opening a simple link panel; if modal, it traps focus, supports Escape and restores focus to its trigger. Documentation navigation uses a labeled modal drawer with active-page indication and groups matching the route manifest. Keep global menu and docs drawer distinct and never stack them. Close on route selection; move focus to the new page heading/main region. Preserve normal browser back/forward behavior and restore scroll appropriately.

Buttons have a 44px minimum target height, 16px horizontal padding and text labels. Primary is accent-filled, secondary outlined, tertiary text. Links remain recognizable through underlining in prose. Hover/focus/pressed states use color and border changes without layout movement. Icon buttons have accessible names. Use Lucide consistently at 16/20px; hide decorative icons from assistive technology.

Tabs are only for equivalent local views, such as request/response examples where space requires it. Use proper tab semantics and arrow-key behavior; essential guide content must remain discoverable, and tab changes must not masquerade as route navigation. Prefer stacked examples when comparison matters.

## Documentation UI

Article order: breadcrumbs → title and concise purpose → applicable development-status notice → optional mobile contents disclosure → content → previous/next links. Right contents navigation reflects h2/h3 structure, links to stable IDs, and marks the current section without color alone. Show a contents rail only when it adds value. Navigation labels, title, breadcrumb and previous/next order come from one manifest.

API articles show method/path, credential type, request headers/body, fields and constraints, success response, then actual route-specific errors. Distinguish JSON from binary responses. A status badge records capability provenance where relevant; do not add fictional API version selectors or a separate website release selector.

Callouts have a small icon, heading and plain explanation; reserve caution styling for concrete limitations. Status labels: “Committed implementation,” “Local development,” “Planned,” and “Not runtime verified” as needed. They describe evidence, not service availability.

### Search

Desktop header has a “Search documentation” control with an optional Ctrl/Cmd+K hint. Mobile uses a labeled search icon/button. Both open one accessible search dialog with a visible input label, close button, results list, and empty/loading/error states. Lazy-load the static Pagefind index on first use. Do not fetch from Lumen.

Results show article title, section context and an excerpt; activating a result navigates to its canonical base-prefixed route/anchor and closes the dialog. Prefer ordinary focusable links for results; add arrow navigation only with correct semantics. Escape closes and restores trigger focus; selecting a result focuses its destination heading. Announce result counts politely after updates without announcing every keystroke. The shortcut must not override text editing or browser/system shortcuts. Include a visible button so keyboard shortcuts are never required.

If the index fails, show an explanation, retry action and links to documentation groups. Search excludes navigation/footer and labels development-only pages in results. Search behavior must be tested against the production static build, not just the dev server.

### Code blocks

Use theme-aware Shiki output generated at build time, language label and a labeled copy button. Copy plain code without prompt prefixes or line numbers; retain the underlying selectable text. Show and politely announce “Copied” after success and an actionable failure message if clipboard access fails. Keep command placeholders explicit and never include real keys.

Use `pre`/`code` semantics, a subtly tinted surface, 16–24px padding, and horizontal scrolling for long lines. Scroll regions must be keyboard usable where needed; copy controls cannot obscure text at zoom. Avoid line numbers by default. Render request and response in a balanced split on wide screens and stacked on mobile. All meaningful example content must be in generated HTML for search and no-JavaScript reading.

### Theme switching

Light is the default first visit. Provide Light, Dark and System options through one accessible control; an explicit choice persists locally. Follow OS changes only when System is selected. If storage is unavailable, theme switching still works for the current page session. Apply the preference early to limit a flash and keep prerender/hydration output consistent. The control exposes the current choice; never rely on an unexplained sun/moon icon. Both themes receive equivalent readability and focus checks.

## Interactive processing simulation

Always show: **“Illustrative simulation. No files are uploaded and no backend is connected.”** No file picker, drag/drop target, token entry, network request, fabricated live event feed, measured latency, or percentage claiming actual progress.

Default diagram uses the committed baseline: register intent → validate/store upload → atomically record jobs and outbox → publisher/queue → metadata worker and thumbnail worker → persisted metadata / thumbnail output. Show thumbnail work as a branch rather than a dependency on completed metadata. Mark ingestion `ready` separately from output completion.

Controls: Play simulation, Pause/Resume while running, and Reset. Use a finite deterministic state sequence with local component state; no animation library or state-management package is necessary by default. Advance node labels such as waiting, active and complete at readable intervals; timing is illustrative. Completed state remains visible until reset, with no automatic loop. Stage selection may reveal a short technical explanation, accessible by keyboard and tap. Do not imply users can control backend jobs.

Desktop uses a horizontal flow with worker branches; mobile uses a vertical ordered flow with indented branches. Keep all stage names available as HTML text; connectors are decorative. Reduced-motion mode uses immediate discrete updates or manual step navigation and no moving connectors. Static/no-JavaScript output displays the entire explanatory diagram. A single restrained live region announces major user-triggered state changes; do not stream every visual update to screen readers.

If a transcoding branch is later added, mark it as local development until PRODUCT.md's publication baseline changes, and place it downstream of metadata-driven profile resolution. Do not advertise it as a committed capability by merely including it in a diagram.

## Motion and accessibility acceptance

Hover/focus transitions: 120–180ms. Drawer/dialog transitions: approximately 180–220ms opacity with minimal movement. Pipeline transitions communicate stage changes only. Content is readable immediately; no scroll-reveal gates, parallax, flashing or perpetual motion. CSS is sufficient initially; Motion requires a concrete reviewed need. [Motion accessibility guidance](https://motion.dev/docs/react-accessibility) is relevant if it is introduced later.

Target WCAG 2.2 AA: semantic landmarks; skip link; logical DOM/tab order; visible focus; focus not obscured; correctly named controls; no keyboard traps outside properly managed dialogs; text/graphic contrast; zoom and reflow; reduced motion; status not conveyed by color alone. Design controls for 44×44 CSS px touch areas where practical, exceeding the 24px AA target minimum. Do not confuse native point/dp guidance with CSS pixels.

Future validation must include keyboard-only navigation, screen-reader smoke checks, 200% text zoom, 400% browser zoom/reflow, both themes, reduced motion, dialog focus restoration, copied-code feedback and base-prefixed deep links. Automated checks supplement manual review; no accessibility conformance claim is made in Phase 1.
