# Lumen Web frontend architecture

Status: Phase 1 proposal; no application, dependencies or deployment workflow created.
Scope authority: [PRODUCT.md](PRODUCT.md), [DESIGN.md](DESIGN.md), [AGENTS.md](AGENTS.md).

## Release scope and system boundary

First release: product landing page, developer guides, API reference and project status information. GitHub Pages serves static website assets only. Lumen remains a separately operated backend; the website does not need a backend connection.

Exclude public uploads, live processing, API-key entry/storage, dashboards, account management, webhook administration and hosted API provisioning. The pipeline interaction is deterministic local UI state. No backend secret, actual `.env` content or project credential belongs in source, browser bundles, build artifacts or Actions configuration.

Backend access is strictly read-only, including during compatibility checks. Do not run its tests, migrations, scripts or services if they can write database/filesystem state. Any future backend runtime verification requires separate authorization and an isolated environment. Never use the backend checkout as the website's build or content-output directory.

## Proposed stack and decisions

| Layer | Decision | Reason / constraint |
| --- | --- | --- |
| Application | React + strict TypeScript | Small reusable components and explicit content contracts |
| Build | Vite, through React Router framework integration | One integrated client/static rendering pipeline |
| Routing | React Router framework mode, static prerendering, no runtime SSR | Real HTML per route; prove project-path compatibility first |
| Styling | Tailwind CSS v4 with semantic CSS variables | Central design tokens; avoid scattered literal values |
| Primitives | Selected shadcn/ui source components | Dialog/drawer and other complex interactions only as needed; inspect primitive dependencies before approval |
| Content | MDX compiled at build time | Maintained prose with a small curated component vocabulary |
| Highlighting | Shiki at build time | Searchable/selectable HTML without a browser highlighter bundle |
| Search | Pagefind over generated HTML | Static search; lazy browser loading; no service credentials |
| Icons | Lucide React, named imports | Consistent functional icons |
| Interaction | CSS and local React state initially | Enough for controls and the finite pipeline simulation |
| Optional motion | Motion only for a justified, approved need | Respect reduced motion and bundle budget |
| Hosting | GitHub Pages project site, later GitHub Actions | Static artifact, no rewrite/server assumptions |

Do not install this table wholesale. Exact package versions, MDX/Shiki integration dependencies, React Router peer requirements and the runtime/toolchain version must be verified before proposing an installation set. No dependency installation is authorized by Phase 1. Defer React Bits and Magic UI; no approved design requires them.

Official implementation references: [React Router prerendering](https://reactrouter.com/how-to/pre-rendering), [Vite static deployment](https://vite.dev/guide/static-deploy.html), [MDX Vite plugin](https://mdxjs.com/packages/rollup/), [Tailwind Vite integration](https://tailwindcss.com/docs/installation/using-vite), [Pagefind](https://pagefind.app/docs/). Recheck these for the chosen versions during Phase 2 rather than copying an untested combination.

## Mandatory compatibility proof of concept

**Before full implementation, Phase 2 must prove the complete static delivery chain.** This is a release gate, not a deferred polish task. Phase 1 does not authorize creating the proof of concept or installing its dependencies. Request Phase 2 approval with the concrete minimal package set and scope.

Limit the proof to a minimal landing route and two nested MDX documents, one with code, an internal link and a heading anchor. Use production-intended integrations, not an unrelated markdown renderer. Keep it reviewable and reusable; no placeholder product UI or full design system is needed at this gate.

| Requirement | Required evidence to record |
| --- | --- |
| Static prerendering | Generated HTML for every proof route contains its title and article body before JavaScript runs; no runtime Node/server deployment |
| MDX compilation | A real `.mdx` article and curated React component render at build time and hydrate without errors |
| Shiki | Highlighted code is in HTML, remains selectable/copyable, and reads in both themes |
| Pagefind indexing | Index generated only after prerendering; a term unique to each MDX article returns the correct document |
| Base paths | Configure `/lumen-web/`; all CSS, JS, fonts, icons, search chunks and internal links resolve under that prefix |
| Nested routes | A route such as `/lumen-web/docs/getting-started/installation/` maps to actual static HTML; normal link navigation works |
| Direct navigation / refresh | Open the nested URL in a fresh browser context and refresh; HTTP success with the correct article, not a fallback shell |
| Hash links | Direct-open and refresh a nested document with a heading fragment; correct heading is visible below the header |
| Browser behavior | Back/forward, trailing slash normalization, route focus and scroll behavior remain correct after hydration |
| Static hosting fidelity | Test using a static server mounted at the project prefix with SPA fallback disabled; Vite dev-server fallback is not evidence |
| Missing routes | Unknown paths produce the intended 404 response/page without an invented server rewrite |
| Build determinism | Clean installation from the approved lockfile, typecheck and production build succeed in the agreed environment |

Inspect the actual router output directory and whether HTML is emitted as directory indexes or flat files. If adaptation is needed for Pages, use a small explicit build step and test it; do not assume a particular output shape. Prove generated Pagefind URLs and asset discovery, including any necessary public path configuration. Both Vite asset base and router basename must be aligned for the chosen framework version; avoid adding the prefix twice.

Record commands, versions, artifact paths, observed HTTP status codes, search results and any console/network failures in the proof review. Local static checks establish compatibility evidence; final acceptance also requires testing the actual Pages URL after a separately authorized deployment. Deployment/publishing is not authorized here.

If the proof fails, stop full implementation and revise this architecture for review. Do not quietly switch to hash routing, add a 404 redirect workaround, replace the framework, or introduce a custom renderer. Those choices change navigation, indexing or maintenance trade-offs. Resolve them explicitly first.

## Routing and URLs

Canonical deployment root: `https://divy2095.github.io/lumen-web/`.
Use readable paths with trailing slashes, for example:

```text
/lumen-web/
/lumen-web/docs/
/lumen-web/docs/getting-started/installation/
/lumen-web/docs/guides/authentication/
/lumen-web/docs/api/register-media/
/lumen-web/docs/project/development-status/
```

The application manifest stores logical routes without deployment prefixes; router/link helpers apply the configured base consistently. Static asset helpers use the build base, including public fonts and Pagefind output. Avoid root-absolute `/assets/...`, filesystem URLs and hardcoded hostname assumptions. Backend example URLs use a clearly named backend origin; never prepend the website base to `/v1/media`.

Every public route must be enumerated for prerendering. Unknown content slugs fail the build or resolve to a real missing-page route. Do not rely on GitHub Pages rewriting every request to `index.html`. GitHub Pages cannot supply runtime dynamic documentation routes.

Use one typed document manifest for slug, title, description, group/order, source module and evidence status. Derive sidebar navigation, breadcrumbs, previous/next links and prerender paths from it. Derive heading IDs and contents links from the same MDX transformation, with duplicate-heading handling. Keep stable IDs when editing headings where existing links matter.

## MDX and content strategy

Compile repository-authored MDX through the supported Vite integration, validated in the proof. Never evaluate user-submitted MDX or fetch executable MDX at runtime. Prefer ordinary Markdown; permit only useful components such as Callout, CodeBlock, ApiEndpoint and a technical diagram.

Content metadata belongs in the typed manifest initially; do not add a frontmatter parser unless actual authoring requirements justify it. Validate required metadata, unique routes, ordering, internal links and referenced headings. Keep paragraphs, examples and tables in article HTML rather than mounting them only after hydration.

Use a compatible build-time Shiki integration; propose its exact package and necessity before installation. Restrict bundled languages to the documented examples. Preserve raw code for clipboard use. Theme styling should not require loading Shiki in the browser. Compile each page as a route module so visiting one article does not download every article.

API reference is hand-authored from inspected route schemas and serializers until the backend offers a verified machine-readable specification. Do not invent an OpenAPI source or code-generation contract. Record the selected backend commit in project status and content review notes. Local working-tree documentation must be labeled and must not silently become supported API reference.

The initial getting-started content cannot be declared complete until project/API-key provisioning and a source-checked command sequence are resolved. The inspected backend also imports an ignored local storage implementation absent from HEAD (see PRODUCT.md); clean-checkout reproducibility is a release blocker, to be resolved outside this website task. Real API examples must show the difference between project keys and issued upload tokens. Protect readers from copying fake response fields or incomplete commands by explaining placeholders and evidence status.

## Search pipeline

Build sequence: validate manifest/content → compile MDX and highlight code → prerender routes → normalize static output if proven necessary → run Pagefind → check links/assets/output → prepare deployment artifact.

Index article content using Pagefind's body selection mechanism. Exclude global/sidebar/footer navigation, copy controls and repeated chrome. Include title/description and status metadata so local-development or roadmap pages are identifiable. Test code text and heading matches; do not index hidden duplicate tab content blindly.

Load Pagefind and index chunks only when search opens; keep the normal page independent of search availability. Resolve the Pagefind import/index path under `/lumen-web/`. Use its supported API behind an accessible dialog or review its supported UI for suitability before choosing; do not add an extra command-palette dependency solely for search.

Provide clear loading, no-results, index-failure and retry states. Result URLs must open directly on the static host. A browser-only SPA render is not an indexing strategy. Search requires a production build or dedicated search-preview step; document that limitation for development.

## Proposed directory structure

This is a plan, not folders created in Phase 1:

```text
app/
  root.tsx                    # shared document/head and theme bootstrap
  routes.ts                   # framework route registration
  routes/                     # landing and docs route modules
  components/
    ui/                       # selected owned primitives
    layout/                   # header, footer, docs shell
    docs/                     # code, contents, search, callouts
    product/                  # pipeline and architecture explanation
  content/
    manifest.ts               # typed route and navigation metadata
    docs/                     # reviewed MDX articles
  lib/                        # small helpers only when needed
  styles/                     # semantic tokens and global/prose styles
public/
  fonts/                      # approved self-hosted font files/licenses
scripts/                      # only proven content/build checks
tests/                        # focused static-host and interaction checks
react-router.config.ts
vite.config.ts
tsconfig.json
.github/workflows/            # future approved CI/deployment
```

Use React Router's conventional `app/` structure rather than maintaining parallel `src/` and framework route trees. Keep application TypeScript strict and components focused. No global state library: theme preference, search dialog and pipeline state are small local concerns. Do not introduce generic registries or wrappers before multiple concrete uses exist.

## Deployment plan

After implementation/deployment approval, use GitHub Actions to check out the website repository, select the verified Node toolchain, install from lockfile, run required checks/build/indexing, upload the static artifact and deploy through the GitHub Pages environment. Trigger policy and repository Pages configuration are decided at that stage. Use minimal permissions, including Pages deployment and OIDC only where required; apply deployment concurrency controls.

The artifact must contain final HTML/assets, Pagefind files and an intentional 404 page. Check whether `.nojekyll` is needed for the chosen artifact mechanism. Do not add a custom domain or assume the backend is hosted alongside the site. No backend checkout is needed in CI: approved website content is self-contained with source references.

After authorized publication, smoke-test root, nested direct links/refresh, search result links, heading anchors, both themes, assets, and an unknown route at the actual project URL. A successful Action alone does not establish website correctness.

## Verification after implementation approval

- Strict typecheck and production build; never claim a check passed without running it.
- Manifest uniqueness, generated route completeness and internal link/anchor checks.
- Static HTML inspection and real HTTP requests with fallback disabled.
- Search term lookup with base-prefixed result URLs and index/chunk loading.
- Focused browser checks for navigation, search Escape/focus restoration, theme persistence, code-copy feedback, and pipeline play/pause/reset/reduced-motion behavior.
- Manual responsive, keyboard, screen-reader smoke, contrast and zoom/reflow review. Automated accessibility checks supplement these.
- Review network output for unnecessary dependencies and accidental backend calls/secrets. Avoid a global pass/fail accessibility or production-readiness claim based only on automated checks.

Do not write tests merely restating CSS values. Favor meaningful behavior and deployment checks that catch likely failures. Baseline bundle/performance measurements follow the proof; no synthetic performance score or arbitrary uptime target is promised here.

## Trade-offs and open decisions

Prerendering adds build configuration compared with a client-only Vite app, but supplies readable HTML, indexable docs and physical nested routes. Framework integration avoids maintaining a separate bespoke React renderer, contingent on the compatibility proof. Hash routing is simpler for static hosts but would change clean URLs/anchors and is not the selected direction.

MDX supports technical components but requires trusted content and consistent build transformations. Pagefind avoids a hosted search account but must be rebuilt with content changes. Selected shadcn/ui components reduce interaction work while bringing owned code and primitive dependencies that still need review. Light-first does not remove the obligation to validate dark mode.

Unresolved: exact compatible versions and install set; static output/base configuration proven on Pages; backend publication revision and missing tracked storage dependency; project/key provisioning; complete tested local onboarding; backend and website license wording; contribution policy; approved font distribution. These are explicit release gates or review items, not permission to expand Phase 1.

## Next phase boundary

Recommend Phase 2 as the compatibility proof only, with minimal approved dependencies and the route/content fixtures required by the table above. Review its evidence before full landing-page/documentation implementation. Approval of these Markdown plans does not authorize scaffolding, installs, commits, pushes or publication.
