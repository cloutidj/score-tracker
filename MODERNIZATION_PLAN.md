# Score Tracker — Modernization Plan

Incremental migration of the Score Tracker app from **Angular 8.2 / Clarity 2** to
**Angular 20 / Clarity 17**, with a full modern-Angular rebuild (standalone, signals,
new control flow). Every phase ends with a **green build + smoke test** so we never go
long without a working app.

## Decisions (agreed)

- **Strategy:** Fresh Angular 20 scaffold, port code feature-by-feature (not `ng update` hops).
- **UI library:** Stay on Clarity, upgrade to latest (v17). Adopt new Clarity/CDS pieces where useful.
- **Modernization level:** Full modern Angular — standalone components, signals, `@if`/`@for`
  control flow, `inject()`, typed reactive forms, `angular-eslint`, modern test runner.

## Why a fresh scaffold instead of `ng update`

- ~12 majors (8 → 20). Several intermediate CLIs won't run on Node 20, so each hop would
  need its own Node version — slow and error-prone.
- The app is small (~83 TS files) and cleanly modularized, so porting is cheaper than
  12 supervised upgrades.
- We get modern tooling (esbuild builder, esbuild/vite dev server, ESLint, standalone APIs)
  on day one and port *into* it.

The current Angular 8 tree stays untouched on the old branch as a reference oracle until
the rebuild reaches parity.

---

## Working model

- New branch off `update-libraries` (or a fresh `modernize` branch).
- Build the new app in a subfolder/parallel workspace first, or scaffold into a clean dir
  and copy `src/` assets across. We keep the **old code readable** for reference during port.
- **Checkpoint discipline:** each phase below must end with
  1. `ng build` succeeds (no errors),
  2. `ng serve` runs and the relevant screen renders,
  3. a manual smoke test of the feature touched (checklist at the bottom).
- Commit at every green checkpoint so we can bisect regressions.

---

## Phase 0 — Prep & baseline (no code changes yet)

- [x] Confirm Node version policy. Angular 20 needs Node ≥ 20.19 / 22.12. You're on Node
      20.14 — **bump to Node 20.19+ or 22 LTS** (use `nvm`/`fnm`). Add an `.nvmrc`.
      → `.nvmrc` pins **Node 22** (LTS). **Action for you: `nvm install 22 && nvm use 22`**
      (you're still running 20.14.0 — Angular 20 CLI won't run until you switch).
- [x] Capture current behavior: run the *deployed* app (GitHub Pages) and screen-record the
      flows so we have a parity target (home → start game → enter scores → charts → saved
      players → color/number pickers → modals). **Manual — left for you to record.**
- [x] Inventory localStorage schema/keys (game state, saved players, preferences) so the new
      `DatabaseService` reads existing data without breaking returning users.
      → See **Phase 0 baseline** appendix below. Only one key exists: `SavedPlayers`.
- [x] Tag/branch the current state as the reference oracle.
      → Annotated tag **`angular8-oracle`** on commit `7daa6b0`.

**Checkpoint:** baseline documented; old app reproducible.

---

## Phase 1 — Scaffold the Angular 20 workspace  ✅ DONE (2026-06-26)

> **Version reality at scaffold time:** the latest Angular is now **22** (not 20) and the
> latest Clarity is **18** (not 17). We took the latest of both — which is the documented
> intent ("upgrade to latest"). Two consequent changes from the original plan:
> - **Zoneless by default.** Angular 22's `ng new` ships zoneless (no `zone.js`). Since the
>   rebuild is signal-driven anyway, we kept zoneless from day one (the plan's stretch goal).
>   `@angular/animations` had to be installed explicitly (Clarity depends on it).
> - **Old app moved to `legacy/`** (via `git mv`, history preserved) so it stays readable for
>   reference during the port. It is outside `tsconfig`/`angular.json`, so it isn't compiled
>   or linted. Removed at Phase 9/10. Reference oracle tag `angular8-oracle` still stands.

- [x] `npm create @angular@latest` → Angular **22**, standalone, SCSS, routing, strict,
      **zoneless**, `@angular/build:application` (esbuild) builder, `--skip-tests` (no specs).
- [x] Re-add PWA: `ng add @angular/pwa`. Ported branded `manifest.webmanifest` (name/theme
      `#084C61`), `icons/*`, `ranking.png`, `favicon.ico` into `public/`. SW wired in
      `app.config.ts` (`provideServiceWorker`).
- [x] Add Clarity **18**: `@clr/angular` + `@clr/ui` + `@cds/core` + `@angular/cdk@22`.
      Global `clr-ui.min.css` wired in `angular.json` `styles`.
- [x] Add charts: `chart.js@4.5` + `ng2-charts@10` (installed, used in Phase 7).
- [x] Add tooling: `ng add angular-eslint` (v22) → `eslint.config.js` + `lint` target scoped
      to `src/**`. **No unit-test runner** (project has no tests; `--skip-tests` used).
- [x] Path aliases (`@models`/`@forms`/`@player`/`@util`) in `tsconfig` `paths` (leading
      `./`, no `baseUrl` — deprecated in TS 6). Trimmed evergreen `.browserslistrc`.
- [x] `App` shell (standalone, `ClarityModule`) with `clr-main-container` layout + header,
      lazy `Home` route, `provideRouter`. Production budget raised (Clarity CSS ≈ 1 MB).

**Checkpoint:** ✅ `ng build`, `ng serve` (200 + correct title/manifest), and `ng lint` all
green; app boots to a Clarity-themed shell.

---

## Phase 2 — Shared infrastructure / `util` (the foundation everything imports)  ✅ DONE (2026-06-26)

Port the shared layer first; later feature phases depend on it.

> **Deviations from the original plan (intentional):**
> - **`chart-data` + `player-scores` deferred to Phase 7.** Both are tightly coupled to the
>   chart.js 2→4 API break (reworked in 7c), and Phase 7a's signal rewrite of
>   `PerRoundScoringService` absorbs `player-scores`' chart responsibilities — porting them
>   now would be throwaway work. **`game-round`** is a per-round-scoring feature model, so it
>   ports with that feature in **Phase 7b**. The four shared models needed by Phases 3/5/6
>   are ported now.
> - **Icons deferred to Phase 4 (as planned).** The number pad/picker used `<clr-icon>`,
>   which is gone in Clarity 18. To keep the harness rendering without pulling Phase 4 forward,
>   the icon buttons use unicode glyphs (`⌨`, `▲`/`▼`) with `<!-- TODO Phase 4 -->` markers.
> - **ESLint selector prefix standardized on `st`** (`eslint.config.js`). The whole app uses the
>   `st-` prefix to make a component's origin obvious; the scaffolded `app-root`/`app-home`
>   components were renamed to `st-root`/`st-home` (and `index.html` updated) so nothing uses the
>   generic `app` prefix.

- [x] **`DatabaseService`** — typed generics (`get<T>`/`save<T>`/`add<T>`/`remove<T>`/`update<T>`),
      no `any`. Fixed the `findIndex` falsy-`0` bug: now checks `index === -1` so the first saved
      player can be edited/removed. localStorage keys unchanged. Kept as a plain service (no
      signals); `SavedPlayerService` will hold signals over it in Phase 6.
- [x] **Models** (`player`, `player-base`, `player-color`, `player-preference`) — ported,
      types tightened, parameter properties, redundant field redeclarations dropped.
      (`chart-data`, `game-round`, `player-scores` deferred — see note above.)
- [x] **Injection tokens** (`DEFAULT_PLAYER_COUNT`=2, `PLAYER_COLOR_LIST`) → provided in
      `app.config.ts` `providers`; `data/player-color-list.ts` ported.
- [x] **Animations** (`in-out`, `counter`, `routing`, `smooth-grow`) — ported; `SmoothGrow`
      is now a standalone component using `inject(ElementRef)`. Build-verified against
      `@angular/animations` 22 + `provideAnimationsAsync()`.
- [x] **`UnsubscribeComponent`** — retired (not ported). Future subscriptions use
      `takeUntilDestroyed`/signals.
- [x] **Modal system** — rewritten with option (a): `ViewContainerRef.createComponent(Component)`
      (no `ComponentFactoryResolver`). `ModalService` API preserved (`createModalOfType`,
      `.result` promise); `ModalContainerComponent` (`<st-modal-container>`) hosted in the app
      shell initializes the service. (CDK `Dialog` still worth considering during review.)
- [x] **Number pad / picker / modal** — ported as standalone; internal state on signals
      (`numberValue`), `NumberPicker` is a signal-based `ControlValueAccessor`. Uses `@for` +
      typed `inject()`.

**Checkpoint:** ✅ `ng build` + `ng lint` green; `ng serve` returns 200 on `/` and `/harness`.
A throwaway **`/harness`** page (`src/app/harness/`, linked in the header) mounts the number
picker + number pad and opens the number modal — **remove it in a later phase.** Visual/manual
smoke of the rendered modal + pad still to be eyeballed in a browser.

---

## Phase 3 — Colors module (self-contained, good signals warm-up)

- [ ] Port `color-filter`, `color-picker`, `color-swatch` as standalone components.
- [ ] Convert component state (selected color, filter) to **signals** + `computed`.
- [ ] Replace any `*ngIf`/`*ngFor` with `@if`/`@for`.

**Checkpoint:** color picker renders, selecting a color works. Build + smoke green.

---

## Phase 4 — Icons (Clarity migration hotspot)

- [ ] `@clr/icons` (`ClarityIcons.add(...)`, `shapes/essential-shapes`) is **gone** in modern
      Clarity. Migrate `IconService` + custom `score-tracker` SVG to **`@cds/core/icon`**
      (`ClarityIcons.addIcons([...])`, `<cds-icon>` web component) and register the icon set
      in `app.config`/bootstrap.
- [ ] Audit every template using `<clr-icon>` and convert to `<cds-icon>` equivalents.

**Checkpoint:** all icons (including custom `score-tracker`) render. Build + smoke green.

---

## Phase 5 — Forms (`shared-forms`)

- [ ] Port `player-info`, `player-score`, `player-selection`, `saved-player-select` and the
      `form.directive` as standalone.
- [ ] Move to **typed reactive forms** (`FormGroup<...>`, `NonNullableFormBuilder`).
- [ ] Local UI state → signals; cross-field rules → `computed`.

**Checkpoint:** player setup form works (add/remove players, pick names/colors). Build + smoke green.

---

## Phase 6 — Player feature (`player` module)

- [ ] Port `saved-players`, `player-preferences-form`, `SavedPlayerService` as standalone +
      a routed standalone component (`loadComponent` lazy route).
- [ ] `SavedPlayerService` state → signals over the typed `DatabaseService`; list views read
      a `computed` signal, no manual subscriptions.

**Checkpoint:** saved players list loads existing localStorage data, add/edit/remove works,
preferences persist. Build + smoke green.

---

## Phase 7 — Per-round scoring (the core feature) + charts

This is the largest phase; split into sub-steps each with a checkpoint.

- [ ] **7a — State service.** Rewrite `PerRoundScoringService`: replace the
      `EventEmitter<ScoreChangeType>` + private mutable fields with **signals**
      (`scores`, `gameRounds`, `currentPlayer`, `currentRound` as signals; chart data as
      `computed`). This removes the manual `scoreChangeEvent` plumbing entirely.
- [ ] **7b — Tables/components.** Port `per-round-scoring`, `per-round-scoring-game`,
      `per-round-score-table` as standalone, reading the signals; convert `*ngFor` tables to
      `@for` with `track`.
- [ ] **7c — Charts (API rework).** Port line + bar chart components to **chart.js 4 /
      ng2-charts 8**: `[colors]` input is gone — fold colors into `datasets`
      (`borderColor`/`backgroundColor`); `BaseChartDirective` usage and `chart.update()`
      patterns changed. Drive chart inputs from `computed` signals; the old "subscribe to
      scoreChangeEvent then call `chart.update()`" goes away (signal change re-renders).
      Verify `scales.yAxes[]` → chart.js 4 `scales.y` object form.
- [ ] **7d — Routing/animations.** Wire the lazy route + route animations.

**Checkpoint per sub-step.** Final 7 checkpoint: full game playthrough — start game, enter
scores per player/round, line + bar charts update live, edit a past score and see charts
reflect it. Build + smoke green.

---

## Phase 8 — App shell, routing, home

- [ ] Port `HomeComponent` + `AppComponent` shell as standalone; `provideRouter` with the
      three routes (`''`, `PerRoundScoring`, `SavedPlayers`) and animation `data`.
      Consider lazy `loadComponent` for the scoring + saved-players routes.
- [ ] Initialize icons + modal host in `AppComponent`/`app.config`.

**Checkpoint:** navigation between all screens + route animations work. Build + smoke green.

---

## Phase 9 — Tooling, tests, CI/CD, cleanup

- [ ] **Lint:** finalize `angular-eslint` rules; delete `tslint.json`, `codelyzer`.
- [ ] **Tests:** port the `.spec.ts` suite to the chosen runner. Update `ViewChild({static})`,
      `TestBed` standalone setup, remove `async`/`fakeAsync` deprecations. Re-establish
      coverage. (Many specs will need touch-ups regardless of runner.)
- [ ] **E2E:** remove `protractor` + `e2e/`. Add Playwright only if you want smoke automation.
- [ ] **PWA:** verify service worker builds and updates correctly in production mode.
- [ ] **CI:** update `.circleci/config.yml` from `node:10-browsers` to Node 20/22; or migrate
      to GitHub Actions (since you deploy to GitHub Pages anyway). Update the deploy step
      (`angular-cli-ghpages` latest). Update/replace the old Office webhook + Codecov orb.
- [ ] **Remove dead deps:** `core-js`, `@webcomponents/custom-elements`, `es5BrowserSupport`
      build option, `protractor`, `tslint`, `codelyzer`, `@clr/icons` (replaced by `@cds`).
- [ ] **Scripts:** fix `package.json` scripts — `ng build --prod` → `ng build` (prod is
      default in modern CLI); revisit `ghp:*`, `run-pwa` (`http-server` still fine).

**Checkpoint:** `lint`, `build`, `test` all green; CI passes; PWA installs.

---

## Phase 10 — Deploy & verify parity

- [ ] Deploy to GitHub Pages; verify against the Phase 0 recordings.
- [ ] Confirm returning-user localStorage data still loads.
- [ ] Lighthouse/PWA check.

**Checkpoint:** production parity confirmed.

---

## Cross-cutting modernization adopted along the way

- **Standalone everything** — no NgModules; `app.config.ts` + `bootstrapApplication`.
- **Signals** for component and service state; `computed` for derived (chart data, totals,
  filtered colors); `effect` only where genuinely needed.
- **New control flow** `@if` / `@for (… ; track …)` / `@switch` replacing structural directives.
- **`inject()`** over constructor injection where it reads cleaner.
- **Typed reactive forms.**
- **`takeUntilDestroyed` / `DestroyRef`** replacing the `UnsubscribeComponent` base class.
- **Zoneless** change detection is the stretch goal (pairs naturally with signals); start
  zone-based if it de-risks the port, flip to zoneless once state is signal-driven.
- **New Clarity / CDS components** evaluated per screen during its phase (e.g. CDS modal,
  updated datagrid/forms) rather than in a big bang.

## Key risks / watch-items

- **Chart.js 2 → 4 is a real API break** (Phase 7c) — the colors model and axis config
  changed; budget time here.
- **Clarity icons → `@cds/core`** (Phase 4) — different package and API, not a version bump.
- **Modal rewrite** (Phase 2) — `ComponentFactoryResolver` is gone; decide custom vs CDK Dialog.
- **Zoneless** can surface missing change-detection assumptions; keep it optional/last.
- **localStorage compatibility** — keep existing keys/shape so deployed users don't lose data.
- **Test suite churn** — expect meaningful spec rewrites regardless of runner choice.

## Phase 0 baseline (captured 2026-06-26)

**Environment**
- Node currently installed: `20.14.0` (too old for Angular 20 → switch to 22 per `.nvmrc`).
- Reference oracle: git tag `angular8-oracle` → commit `7daa6b0`. Old Angular 8 tree stays
  on `update-libraries` / `master` for side-by-side reference.

**localStorage inventory** — the new `DatabaseService` must preserve this exact shape so
returning users keep their data. There is **only one key**; no game-state or preferences
persistence exists (game state is in-memory only).

| Key | Type | Written by |
|-----|------|------------|
| `SavedPlayers` | `PlayerPreference[]` | `SavedPlayerService` (`src/app/player/saved-player.service.ts`) |

`PlayerPreference` JSON shape (one array element):

```json
{
  "name": "string",
  "color": { "red": 0, "green": 0, "blue": 0 },
  "playerPreferenceId": 1700000000000
}
```

- `playerPreferenceId` is a `Date.now()` timestamp used as the unique id.
- `color` deserializes to a plain object; the old service re-hydrates it into a `PlayerColor`
  instance via `Object.assign(new PlayerColor(0,0,0), player.color)` on read (the new typed
  service must do the equivalent so `rgbString()`/`hexString()` work).
- Missing/non-array value → service initializes the key to `[]`.

**Known bugs to fix during port (carried into Phase 2):** `DatabaseService.remove`/`update`
use `if (!toRemove)` on a `findIndex` result, so index `0` is wrongly treated as "not found"
— the first saved player can't be edited/removed.

## Smoke-test checklist (run at each relevant checkpoint)

1. App boots, Clarity theme + all icons render.
2. Home → start a new game with N players (names + colors).
3. Number pad / number picker entry works; modals open and close.
4. Enter scores across multiple rounds; current-player/round advances correctly.
5. Line + bar charts render and update live as scores are added.
6. Edit a previous score → totals and charts update.
7. Saved players: existing data loads; add/edit/remove persists across reload.
8. Player preferences persist.
9. Navigation + route animations between all three routes.
10. Production build installs as a PWA and works offline.
