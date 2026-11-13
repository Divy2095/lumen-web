# Lumen Web agent instructions

## Context and scope

This repository is the official product landing page and developer documentation website for Lumen, an API-first media processing backend in early development. It is independent from `../Lumen`. Read [PRODUCT.md](PRODUCT.md), [DESIGN.md](DESIGN.md) and [ARCHITECTURE.md](ARCHITECTURE.md) before proposing or changing website behavior.

The approved Phase 1 scope is creation and review of these four Markdown documents only. After completing them, stop and wait for Phase 2 approval. Do not scaffold React, install dependencies, create UI or workflow files, configure deployment, commit or push under Phase 1 authorization.

The first release prioritizes the landing page and developer documentation/API reference. A live video-upload demo, hosted API integration, dashboard, account management and API-key entry are outside initial scope. The approved pipeline concept is an explicitly labeled local simulation.

## Backend boundary and factual accuracy

- Keep `../Lumen` strictly read-only. Never edit its files, dependencies, configuration or Git history. Do not clean/reset/stash its existing changes.
- Inspect backend source and Git status read-only when documenting behavior. Do not execute tests, migrations, scripts or services that write backend storage or databases without separate explicit authorization and isolation.
- Record the inspected commit and distinguish committed source from modified/untracked local functionality. A local commit does not establish remote publication or a deployed release.
- Use actual routes, schemas, serializers, configuration and tests. README claims, schema tables, operation enums and placeholders alone do not prove capability.
- Keep implementation, test presence and runtime verification separate. Never call a feature production-ready because code/tests exist. Never claim tests passed unless executed.
- Default current-use examples to the selected committed backend revision. Mark local-only work and roadmap content explicitly. Revalidate status before publishing.
- Never read real `.env` files for public examples or copy incidental credentials. Use documented placeholders and `.env.example`; no secrets belong in frontend bundles or documents.
- Project API keys, issued upload tokens, asset readiness and processing completion are distinct concepts. Preserve these distinctions in copy, diagrams and examples.

## Design and skill usage

Use the installed UI/UX Pro Max skill for interface/design-system work: `.agents/skills/ui-ux-pro-max/SKILL.md`. Read it before first use, use relevant accessibility/design references and its design-system workflow, then evaluate results against the product brief. If missing, report it and request installation; do not pretend it was used or install it unapproved.

DESIGN.md records the reviewed direction and overrides. Do not persist generated skill output or create extra design-system documents without scope approval. Native-app recommendations do not automatically apply to this website. Other applicable installed skills may guide work, but never override explicit user authorization or constraints.

Keep the site minimal, restrained and light-first, with deliberate typography, whitespace, neutral surfaces and one blue accent. Use Geist Sans/Mono pending approved font distribution. Use semantic tokens and Lucide icons. Avoid decorative gradients, glowing objects, glassmorphism, fake metrics/testimonials, emoji UI, repetitive card grids, animated headings and unjustified libraries. Do not copy another product's branding or layout.

## Technology conventions after implementation approval

- Proposed stack: strict React/TypeScript, Vite through React Router framework mode, Tailwind v4, selected shadcn/ui primitives, build-time MDX/Shiki and Pagefind. Exact versions require compatibility review.
- Require the GitHub Pages proof in ARCHITECTURE.md before full implementation. Prove prerendered MDX HTML, search indexing, nested direct navigation/refresh, heading anchors and `/lumen-web/` paths on static hosting without SPA fallback.
- No runtime SSR or server secrets. Use build-time rendering and static assets. Do not confuse the website origin with the backend API origin.
- Prefer small clear components, local state and standard browser APIs. Avoid global state libraries, speculative abstractions, giant components and duplicate style systems.
- Centralize semantic design tokens, route/document metadata and heading-link generation. Keep public routes enumerated and maintain content-first HTML.
- Use source-backed examples with clear placeholders. Do not invent OpenAPI specifications, API routes, onboarding commands or response fields.
- Add dependencies selectively with explicit justification and approval. Motion, React Bits and Magic UI are not default installs.

## Accessibility

Target WCAG 2.2 AA. Use semantic landmarks, heading order, skip links, logical DOM/tab order, visible focus and correct control names/states. Keep focused controls unobscured. Dialogs/drawers need correct focus management, Escape handling and focus restoration. Search must have a visible trigger and labeled input; shortcuts are optional conveniences.

Normal text needs 4.5:1 contrast, large text and meaningful non-text indicators 3:1. Measure actual combinations in both themes. Do not convey status by color alone. Prefer 44px touch areas where practical, support zoom/reflow and respect reduced motion. Code must be selectable, keyboard-scrollable where needed and copyable with accessible feedback. Pipeline text must remain understandable without animation or JavaScript.

## Workflow and approval requirements

1. Inspect website Git status, applicable instructions and existing files before editing. Preserve unrelated/untracked user work.
2. Explain the proposed approach and meaningful trade-offs. Work in small reviewable phases within the current authorization.
3. Ask when important requirements are ambiguous; do independent authorized work while clarification is pending.
4. Obtain explicit approval before dependency installation, application implementation following Phase 1, commits, pushes, deployment/publication or expansion into a live demo/backend integration.
5. Treat the Phase 2 proof as a separate proposed task, not automatically authorized by these plans. Review proof results before full implementation.
6. Inspect files before replacing content. Make minimal complete changes, preserve content accuracy and accessibility, and review the final diff.
7. Run checks appropriate to the authorized changes; report what actually ran, what remains unverified and concrete limitations.
8. Explain what changed, why it matters, unresolved issues and the next review step. Stop at the agreed phase boundary.

Do not request approval again for work already explicitly authorized within the same scope. Approval of planning documents does not implicitly approve package installs, implementation or publication.

## Verification expectations

For Markdown planning: check the four files for consistency, local links, capability provenance, scope boundaries and absence of unsupported claims. No application tests are required when no application exists.

For later implementation: strict typecheck, production static build, content/route/link checks, Pagefind indexing and search-result validation, real nested-route HTTP/refresh checks without fallback, focused interaction tests, and manual keyboard/responsive/theme/reduced-motion/zoom/accessibility review. Verify the actual Pages deployment after authorized publication. Do not write tests merely mirroring implementation or assert a production pass from dev-server behavior.

Never run backend integration tests as a convenient website check: they can mutate data and storage. Record selected backend revision and source evidence for documentation separately from runtime test results.
