# web-kosh

Personal website. Angular app lives in `web/`. The previous plain HTML/CSS/JS
version is kept in `archive/` for reference only — never edit it, never wire
it into the build.

## Composition-first rule

The whole point of this app is that a new page is assembled from existing
pieces, not written from scratch. Before adding markup/logic to a page,
check whether it already exists as a component under `shared/components/`.
If similar-but-not-identical UI is needed, prefer extending an existing
component with an `@Input`/slot over copy-pasting its template.

A new page should read almost like a list of `<app-*>` tags in its template.

## Structure (`web/src/app/`)

- `core/` — singleton services, models, no UI. Injectable with `providedIn: 'root'`.
  - `theme/theme.service.ts` — current theme as a signal, persists to
    localStorage, applies `data-theme` on `<html>`.
  - `i18n/` — site-wide localisation (Ukrainian + English), used by every page.
    `I18nService.lang` is a signal (persisted, sets `<html lang>`), `t(key, params)`
    translates with `{placeholder}` filling; templates use the `t` pipe
    (`{{ 'nav.me' | t }}`). All strings live in `i18n/strings/uk.ts` and `en.ts`.
  - `storage/local-storage.ts` — try/catch wrappers around localStorage; use
    these instead of touching `localStorage` directly.
  - `timeline/timeline.service.ts` — fetches timeline data.
  - `models/` — plain interfaces/types shared across the app.
- `shared/components/` — presentational, reusable, standalone components.
  Each owns its own template + scss file (no inline templates/styles).
  Each is self-contained: state it needs (e.g. gallery open/closed) lives
  inside the component, not lifted to a parent unless truly shared.
  - `theme-toggle/` — button that reads/toggles `ThemeService`.
  - `typing-text/` — renders `[text]` input with a typewriter effect.
  - `image-gallery/` — takes `[images]: string[]`, renders a thumbnail grid;
    clicking an image opens a fullscreen viewer with a thumbnail rail and
    keyboard (Esc/←/→) navigation. Fully self-contained, reusable anywhere a
    list of image URLs needs to be browsable.
  - `timeline/` — fetches timeline items via `TimelineService`, renders the
    work/personal filter toggles and the timeline list, delegating any
    per-item images to `image-gallery`.
- **One page shape everywhere:** a full-height column on the left (home: photo
  and links; kid-tasks dashboard: intro, 320px; worksheet pages: the settings,
  320px, sticky) and the content on the right; it stacks on phones. New pages
  follow it. Exception: the CV, which is a centred sheet of paper.
- `layout/` — structural chrome shared across pages: the header with the nav,
  the language switch and the theme toggle. Every page, including kid tasks,
  gets language and theme from this one top panel — never add page-local
  language/theme pickers.
- `pages/` — one component per route. A page composes `layout` +
  `shared/components` + its own layout CSS. Avoid putting reusable logic
  directly in a page component — push it down into `shared/components` or
  `core` instead.
  - If a page has several distinct logical blocks (sections of a document,
    steps of a flow, etc.) and you expect to reshuffle/restyle them, split
    it into `pages/<name>/sections/<block>/` — one component per block,
    page-local (not under `shared/`, since they're only meaningful in this
    page's context). The top-level page component then does almost nothing
    but wire fetched data to `<app-*>` tags in a fixed order, so trying a
    different layout means reordering/restyling those tags, not rewriting
    markup. See `pages/cv/` for the pattern.

## CV (`pages/cv/`, route `/cv`, English only)

- Not in the top nav on purpose: it is reached from the small CV icon next to
  LinkedIn/GitLab/GitHub on the home page (the owner doesn't want the CV
  highlighted above the other resources).

- Data: `public/data/cv.json` (`core/models/cv.model.ts`) is structured, not
  prose blocks: jobs have `start`/`end` ("YYYY-MM", or "YYYY" if the month is
  unknown; `end: null` = current) and a short `stack` tag list; skills are
  `skillGroups` with `core: true` marking the short (sidebar) list. Durations are
  computed in `cv-period.ts` (inclusive months, LinkedIn-style) — never type them.
- Sections (`pages/cv/sections/`): one presentational component each, data in
  via signal inputs, all wrapped in the `cv-section` shell (spaced uppercase
  heading). Generic ones are reused: `cv-text` (about / AI / summary),
  `cv-list` (soft skills, languages, hobbies, domains), `cv-skills`
  (`variant: 'core' | 'all'`).
- Layouts (`cv-layouts.ts`) are config, not templates: areas holding ordered
  section slots (+ `printBreak`). `cv.component.html` renders any layout; its
  look is `.layout-<id>` in `cv.component.scss`, driven by CSS variables such as
  `--cv-heading-size` per area. Only `classic` (the PDF look) exists so far;
  planned: more layouts, a layout switcher, section variants (skill cloud,
  experience timeline) and cross-highlighting via the job `stack` tags.
- The CV is always black-on-white paper (both themes). Print uses the named
  `@page cv` with margins; check changes by printing to PDF (Classic = 5 A4
  pages, page 1 must keep both columns). Use `@media screen` for phone rules —
  an A4 print page is narrow enough to trigger plain `max-width` queries.

## Localisation

- **No hard-coded UI text** in templates or components: every string goes into
  both `core/i18n/strings/uk.ts` and `en.ts`. Missing keys fall back to English,
  then to the key itself. Ukrainian is the main language of kid tasks.
- Key prefixes: `nav.`, `site.`, `timeline.`, `theme.`, `app.` (site chrome);
  `kids.`, `common.`, `w.`, `m.`, `c.`, `p.` (kid tasks: dashboard, shared,
  writing, math, colours, papers).
- In code use `I18nService.t()`; in templates the `t` pipe. Both read the
  `lang` signal, so OnPush views re-render on a language switch with no
  extra wiring. Don't cache translated text in state.
- Content data carries its own translations: in `public/data/timeline.json`
  every text field is either a plain string (same in all languages — years,
  company-name links) or `{ "en": …, "uk": … }` (`LocalizedText`). Render it
  with the `localize` pipe or `I18nService.localize()`. Company names are never
  translated; translate only the words around them. Entry titles stay English
  in every language (owner's choice), and so does the 1987 "Born" entry.
- Starter content of new kid sheets (e.g. the sample writing sheet) is created
  in the current language from `*.default.*` keys; once saved it is user text.

## Kid tasks (`pages/kid-tasks/`, route `/kid-tasks`, lazy-loaded)

Printable A4 worksheets for kids, generated in the browser ("Worksheet Press").
Ported from a standalone plain-JS app, behaviour kept 1:1.

- `kid-tasks.routes.ts` — dashboard + one route per worksheet page:
  `home/` (cards), `writing/`, `math/`, `colors/`, `words/` (words & pictures),
  `paths/` (arrow paths), `papers/`.
- Each page = `<page>.model.ts` (types, defaults, **pure generator
  functions** returning data) + a component (state, actions) + a template
  that renders that data. Generators never produce text, only keys
  (colour, shape, operation), so saved sheets survive a language switch.
- **Phones (below 900px, `PHONE_LAYOUT_QUERY` in `kit/layout.ts`):** no sheet
  preview and no Generate button; Print generates fresh tasks and then prints
  (`sheet-actions`). Desktop prints exactly the preview. Pages where you edit
  inside the sheet (Writing) set `[previewOnPhones]="true"`. The preview is
  hidden with `@media screen` only, so it still prints.
- **A new task is assembled from the kit**, not hand-built: its rail is a list of
  `app-rail-group`s holding kit controls, then `app-sheet-actions`, then the
  saved list; page-per-puzzle sheets are `app-page-sheet`s. The page itself only
  owns its settings logic, generator (`<task>.model.ts`) and the sheet body.
  Never hand-write `.grp`, checkboxes, pill loops, print buttons or the storage
  note in a page — if a control is missing, add it to the kit.
- `components/` — the reusable worksheet kit:
  - `worksheet-layout` — rail + stage shell (`titleKey`, `taglineKey`,
    `[stacked]` for several sheets, `storageKey` for the note at the rail's end); rail content is projected with
    `<ng-container ngProjectAs="[rail]">`.
  - `toggle-pill.directive` (`button[wsTogglePill] [on]`), `level-picker`
    (1·2·3), `task-row` (pill + level + hint), `saved-list` (saved sheets),
    `shape` (coloured SVG shapes + the `COLORS`/`SHAPES` tables),
    `rail-group` (rail block: `titleKey`, content, `hintKey` + `hintParams`),
    `check-option` (checkbox + label + optional note),
    `toggle-group` (on/off pills from `ToggleOption[]`, optional colour dot,
    keeps `min` on and shows `minMessageKey` with `{n}`),
    `sheet-actions` (Generate? / Print / "save as" name / Save / hint; extra
    buttons projected; printing is handled inside),
    `page-sheet` (one A4 page: `how`, optional `note`, body, "Done!" box; owns
    the page break),
    `number-stepper` (field + big − / + buttons, optional `captionKey`, clamps to min/max itself and
    emits a clean number; `size="small"` for in-sheet toolbars — use it for
    every number setting, never a bare `<input type="number">`),
    `match-block` (two columns joined by pencil lines; the page passes
    `let-i` templates for each side — used by colours and words & pictures).
- `kit/` — `WorksheetStore` (working state + saved library in localStorage),
  `random.ts` (`rnd`, `pick`, `shuffle`, `clone`), `files.ts` (file picker,
  image downscale, `clampField` for number inputs).
- Shared worksheet CSS is global in `src/styles/_worksheets.scss`, scoped under
  `.ws` (tokens, rail, inputs, pills, the white A4 `.sheet`, print rules);
  page SCSS keeps only what is specific to that page. `.sheet.page` is the shared
  "exactly one A4 page" sheet (instruction `.how`, `.body`, `.done` box, page
  breaks) used by colours and arrow paths.
- Words & pictures: `words/vocabulary.ts` lists pictures (emoji) with ONE clear
  name; the words are i18n keys `v.<key>` in both languages. Leave out
  look-alikes (🐔/🐓, 🧸 vs 🐻, 🍬/🍭, 🌳/🌲…) and keep every word unique per
  language, or a sheet can have two right answers. Length filters count
  letters only and use the current language; after a language switch only
  pages that no longer fit are regenerated. Every picture has a `set` (same
  names as the math picture sets, plus `home`); the sheet uses only enabled sets.
- Arrow paths: difficulty is only the number of steps (3–14, default 6; the
  grid and longest step grow with it — `gridFor()`). No pre-drawn example step:
  the owner found it confusing. The generator's guarantees (start on the left
  edge, no point visited twice, no repeated/reversed direction, end on the
  top/right/bottom border) are what make the answer unique — keep them.
  Obstacles (0–12, default 4, themed per pair) go only in squares that share
  not even a corner with the path (`placeObstacles`), so the correct path never
  touches one — the sheet promises that. Changing the count keeps each path.
- **Never rename a page's storage key** (`worksheet-press-*`): that loses the
  user's saved sheets. Merge loaded state with defaults so new options appear
  in old saves.
- Page state is a plain mutable object changed only in event handlers (which
  trigger OnPush change detection); after async work (file reads) call
  `markForCheck()`.

Worksheet design rules (audience: kids 8+, including autistic kids):
- One task type per page, same layout every time, a short instruction line in
  the kid font (Andika). No title and no "Name: ____" on the printed sheet.
- Every task must have **exactly one correct answer**; no trick questions.
  When changing a generator, run it many times (uniqueness, answer present,
  no duplicates) before calling it done.
- Task types are toggles, each with its own difficulty 1–3; the level changes
  parameters, not the wording (unless a level adds a rule: `c.how.<task>.<level>`).
- The sheet is always paper-white with dark ink, even in dark theme. Say in
  the rail when a page needs a colour printer.
- Check changes by printing to PDF: each sheet must fit one A4 page.

## Conventions

- Standalone components only (no NgModules). Every component sets
  `changeDetection: ChangeDetectionStrategy.OnPush`.
- State: Angular `signal()`/`computed()`, not RxJS `BehaviorSubject`, unless
  the data is inherently a stream (HTTP calls use `HttpClient` + `Observable`
  as usual, converted to state via `.subscribe()` into a signal, or
  `toSignal()`).
- Styling: SCSS, one file per component, scoped to that component. Global
  theme variables (colors) live in `src/styles.scss` under `:root` and
  `[data-theme='dark']` — components consume them via `var(--token)`, never
  hardcode colors.
- New components use signal inputs/outputs (`input()`, `output()`); older
  ones still use `@Input` — convert them when touching them.
- Static assets (images, fonts, pdfs, JSON data files) go in `web/public/`
  and are referenced with an absolute path (`/img/...`, `/data/...`).
- Do not reach into `document`/`localStorage` from components directly for
  anything already wrapped by a `core` service (e.g. theme) — go through the
  service.

## Adding a new page

1. Create `pages/<name>/<name>.component.ts` (+ html/scss), standalone,
   composed from existing `shared/components` where possible.
2. Register its route in `app.routes.ts`.
3. If the page needs a new nav entry, add it to `layout/header`.
4. Only create a new `shared/components/*` piece if the page needs UI that
   doesn't exist yet — and build it generic enough (via `@Input`) that other
   pages could reuse it too.

## Planned

- Firebase integration is planned (likely hosting + maybe Firestore/Auth
  later). Don't hardcode assumptions that preclude adding a `core/firebase/`
  service later.
