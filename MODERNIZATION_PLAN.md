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
- [x] Add Clarity **18**: `@clr/angular` + `@clr/ui` + `@angular/cdk@22`.
      Global `clr-ui.min.css` wired in `angular.json` `styles`.
      > **v18 correction (2026-06-26):** the scaffold also pulled in `@cds/core`, but Clarity 18
      > [drops the `@cds/core` dependency](https://clarity.design/pages/update-to-v18): `@clr/angular`
      > no longer depends on it and has absorbed all supported pieces — `cds-icon`, the CSS design
      > tokens, and the CSS utilities (`cds-layout`, `cds-text`) — directly, while `@clr/ui` now
      > ships all required styles. `@cds/core` was never actually imported by our code (icons come
      > from `@clr/angular`, styles from `@clr/ui`), so it was a dead dependency and has been
      > **removed from `package.json`**. (`cds-list` was *not* migrated; we don't use it.)
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

## Phase 3 — Colors module (self-contained, good signals warm-up)  ✅ DONE (2026-06-26)

- [x] Ported `color-filter`, `color-picker`, `color-swatch` to `src/app/util/colors/` as
      standalone components (no `ColorsModule`); each imports only what it needs.
- [x] **`ColorSwatchComponent`** — signal `input()`s (`color`/`active`/`clickable`). The
      deserialize re-hydration moved into the `color` input `transform` (`Object.assign(new
      PlayerColor(), val)`). Template uses `[class.active]`/`[class.clickable]`/`[style.*]`
      instead of `ngClass`/`ngStyle`.
- [x] **`ColorPickerComponent`** — signal-based `ControlValueAccessor` mirroring
      `NumberPicker`: `selectedColor` is a signal; `inject(PLAYER_COLOR_LIST)` over constructor
      DI; `onChange`/`onTouch` typed (no `any`). `writeValue` re-hydrates the incoming color
      before matching against the canonical list. `*ngFor` → `@for (… ; track hexString())`.
- [x] **`ColorFilterComponent`** — `selectedColors` as a signal; `colors` a signal `input()`;
      keeps the RxJS `Subject` for Clarity's `ClrDatagridFilterInterface.changes`. `*ngFor` →
      `@for`. (No `computed` needed — derived booleans are cheap method calls.)
- [x] Harness extended with the color picker (`[(ngModel)]`) for a live CVA smoke test.

**Checkpoint:** ✅ `ng build` + `ng lint` green; `ng serve` returns 200 on `/` and `/harness`;
color picker renders and binds the selected color via `ngModel`. (Filter exercised for real
when the saved-players datagrid lands in Phase 6.)

---

## Phase 4 — Icons (Clarity migration hotspot)  ✅ DONE (2026-06-26)

- [x] **Render via the standalone `ClrIcon` component, not the CDS web element.** `@clr/angular`
      18 ships a standalone `ClrIcon` Angular component (selector `clr-icon, cds-icon`, real
      `@Input()`s `shape`/`size`/`status`/`direction`/`flip`/`solid`/`inverse`/`badge`). It
      renders the SVG itself from `ClarityIcons.registry`, so it needs **no**
      `@cds/core/icon/register.js` and **no** `CUSTOM_ELEMENTS_SCHEMA` — `imports: [ClrIcon]`
      gives full template type-checking. (The deprecated `ClrIconModule`/`CdsIconCustomTag` path
      and the raw `@cds/core` `<cds-icon>` web component + `CUSTOM_ELEMENTS_SCHEMA` were both
      rejected in favor of this. This is exactly the direction Clarity 18 takes: `cds-icon` is now
      an Angular component shipped *inside* `@clr/angular`, not a `@cds/core` web component, so no
      `@cds/core` dependency is needed — see the v18 correction under Phase 1.)
- [x] Migrated `IconService` (`src/app/icons/icon.service.ts`) + the custom `score-tracker`
      SVG (`src/app/icons/svg/score-tracker.ts`): `ClarityIcons.addIcons(...)` with tree-shaken
      icon tuples, **all imported from `@clr/angular`** (it re-exports the whole icon module:
      `ClarityIcons`, `ClrIcon`, and every `*Icon` tuple), so there are no `@cds/core` deep
      imports anywhere. Registered the full app icon set up front (so later phases just drop in
      `<cds-icon>`): `score-tracker` (custom), `angle`, `bar-chart`, `error-standard`, `floppy`,
      `keyboard`, `line-chart`, `plus`, `success-standard`, `times`, `user`, `users`.
- [x] Wired registration in `app.config.ts` via `provideAppInitializer(() =>
      inject(IconService).initialize())` (Angular 22 functional initializer).
- [x] Converted the two `<!-- TODO Phase 4 -->` placeholders to `<cds-icon>` (matched by
      `ClrIcon`): number-pad → `<cds-icon shape="keyboard" solid size="24">`; number-picker
      increment → `<cds-icon shape="angle" status="success">`, decrement →
      `<cds-icon shape="angle" direction="down" status="danger">`. Both components got
      `imports: [ClrIcon]`. The other legacy `<clr-icon>` templates (app shell, forms,
      per-round, player) don't exist in the new app yet — they'll import `ClrIcon` when ported.
- [x] **Clarity 18 API mapping captured:** `clr-icon`→`cds-icon` (or keep `clr-icon`; `ClrIcon`
      matches both); `caret`→`angle` (rotate with `direction="up|down|left|right"`);
      `class="is-solid"`→`solid` attr; `class="is-success/is-danger"`→`status="success|danger"`
      (color now lives on the icon, so the number-picker SCSS status-color hack was deleted).
      `ClrIcon`'s shadow-DOM styles resolve status colors against the `--cds-alias-status-*`
      tokens already shipped in `clr-ui.min.css` — no extra `@cds/core` global CSS needed.
      `IconShapeTuple` isn't re-exported from the icon barrel, so the custom icon is typed
      structurally as `[string, string]`.

**Checkpoint:** ✅ `ng build` + `ng lint` green; `ng serve` returns 200 on `/` and `/harness`;
`keyboard` + `angle` icons render on the harness. Custom `score-tracker` icon renders for real
when the app shell lands in Phase 8.

---

## Phase 5 — Forms (`shared-forms`)  ✅ DONE (2026-06-26)

> **Deviations from the original plan (intentional):**
> - **`SavedPlayerService` read path brought forward from Phase 6.** `saved-player-select` depends
>   on it, so a signals-based `SavedPlayerService` (`src/app/player/saved-player.service.ts`) was
>   ported now: `savedPlayers` is a read-only `Signal<PlayerPreference[]>` over the typed
>   `DatabaseService`, colors re-hydrated to `PlayerColor` on load. `addPlayer`/`editPlayer`/
>   `removePlayer` are included (trivial) but unused until **Phase 6** builds the saved-players list
>   + preferences UI on top.
> - **`FormDirective.providers` dropped.** Legacy listed `FormDirective` in `PlayerSelectionComponent`'s
>   `providers` *and* matched it via the `form[clrForm]` selector — the provider instance was dead
>   (descendants resolve the directive instance on the `<form>` element). `player-selection` now just
>   imports the standalone `FormDirective`; `player-info` `inject(FormDirective, { optional: true })`
>   and `viewChild.required(FormDirective)` both resolve the one form-element instance.
> - **Two legacy logic bugs fixed (matching the unit-test contract):** `setPlayers` used `i <= count`
>   (off-by-one → an extra card) and mutated the array mid-loop on removal; it now produces exactly
>   `count` cards. `uniquePlayerInfo` returned `{}` when valid (a truthy errors object → permanently
>   invalid form); it now returns `null` when there are no duplicates. Both align with the legacy
>   `.spec.ts` expectations (3 cards for default count 3; valid form emits on submit).
> - **Zoneless color-picker error.** `showColorPickerError` is a `computed` over a `colorTouched`
>   signal + `toSignal(colorControl.statusChanges)`, because marking a `FormControl`
>   touched/invalid does **not** schedule change detection under zoneless — the old method-on-CD
>   approach wouldn't repaint the error on submit.

- [x] Ported `player-info`, `player-score`, `player-selection`, `saved-player-select` and the
      `form.directive` to `src/app/forms/` as standalone components/directive.
- [x] **Typed reactive forms** via `NonNullableFormBuilder`: `playerInfoForm`
      (`name`/`color: PlayerColor | null`), `playerCountForm`, and `playerInfoForm.players` as a
      typed `FormArray<FormControl<Player>>` with `Validators.required` + `uniquePlayerInfo`.
- [x] **`PlayerInfoComponent`** — signal-based CVA + `Validator`; `playerInfo` is a signal `input()`;
      `valueChanges`/`touchEvent` subscriptions use `takeUntilDestroyed`; merges form value onto the
      input player (`{ ...playerInfo(), ...value }`) without mutating the input.
- [x] **`PlayerScoreComponent`** — signal `input()`/`output()`; `<clr-icon>`→`<cds-icon>` (`solid`,
      `[style.color]`) via standalone `ClrIcon`.
- [x] **`PlayerSelectionComponent`** — `playerInfo` as a `signal<Player[]>` driving the `@for` cards
      (keeps the list reactive under zoneless); `*ngIf`/`*ngFor`→`@if`/`@for`; `ChangeDetectorRef`
      removed; `viewChild.required(FormDirective)`; status icons via `status="success|warning"`.
- [x] **`SavedPlayerSelectComponent`** — inline template, `output()`, `takeUntilDestroyed`; keeps the
      reset-to-null trick so re-selecting the same player re-emits.
- [x] Lint: `form[clrForm]` selector + the two Clarity `<label>`s (associated at runtime by
      `clr-input-container`/`clr-select-container`, undetectable by the rule) carry targeted
      `eslint-disable` comments.
- [x] Harness extended with `st-player-selection` (logs selected players) + `st-player-score`.

**Checkpoint:** ✅ `ng build` + `ng lint` green; `ng serve` returns 200 on `/` and `/harness`.
Player-count picker adds/removes cards; per-card valid/invalid icon; duplicate name/color alerts;
"Start Game" emits the typed player list. Visual smoke of the form still to be eyeballed in a browser.

---

## Phase 6 — Player feature (`player` module)  ✅ DONE (2026-06-26)

> **Deviations from the original plan (intentional):**
> - **`SavedPlayerService` was already ported in Phase 5** (read path *and* `addPlayer`/
>   `editPlayer`/`removePlayer`), signal-backed over the typed `DatabaseService`. Phase 6 just
>   builds the management UI on top, so the service was not re-touched here.
> - **List view reads the `savedPlayers` signal directly, not a `computed`.** The plan said
>   "list views read a `computed` signal"; there's no derivation to compute (the datagrid
>   consumes the list as-is), so the template calls `savedPlayerService.savedPlayers()` and the
>   legacy `| async` is dropped. No manual subscriptions remain.
> - **`saved-players` keeps `*clrDgItems`, NOT `@for`.** The datagrid's filter/sort pipeline
>   (the `st-color-filter` `accepts()` filter and `clrDgField` column sort) is driven by the
>   `*clrDgItems` structural directive — converting to `@for` would bypass it. So the row loop
>   stays on `*clrDgItems="let player of savedPlayerService.savedPlayers()"`.
> - **`cancel` output renamed to `cancelEdit`.** `@angular-eslint/no-output-native` flags
>   `cancel` as a native DOM event name; renamed (template binding updated to match).
> - **Route path preserved as `SavedPlayers`** (legacy casing) so deep links/bookmarks for
>   returning users still resolve. A "Saved Players" nav link was added to the app shell header
>   (the shell is formalized in Phase 8; this is a temporary entry point alongside Harness).

- [x] Ported `saved-players` + `player-preferences-form` to `src/app/player/…` as standalone
      components; wired a lazy `loadComponent` route at `SavedPlayers`
      (its own `saved-players-component` chunk). `SavedPlayerService` already signal-backed (Phase 5).
- [x] **`SavedPlayersComponent`** — `currentPlayer`/`showForm` as signals; `*ngIf`→`@if` for the
      form; `[@formAnimation]` `:enter` `slideInLeft` preserved; `<clr-icon>`→`<cds-icon>` (`plus`).
      Reads the `savedPlayers` signal; no subscriptions. `saveValues` merges edits onto the kept
      `PlayerPreference` (id flows through the component, not the form).
- [x] **`PlayerPreferencesFormComponent`** — signal `input()` `playerData`, `output()`s
      (`save`/`cancelEdit`); the wrapped `st-player-info` CVA is re-seeded via an `effect` over
      `playerData()` (replacing the legacy `@Input set` + `patchValue`); `<clr-icon>`→`<cds-icon>`
      (`floppy`/`times`) via ClarityModule's standalone `ClrIcon`.

**Checkpoint:** ✅ `ng build` + `ng lint` green; `ng serve` returns 200 on `/`, `/SavedPlayers`,
`/harness`. Saved-players datagrid + add/edit/delete + color filter render; localStorage
load/persist and the add/edit/remove round-trip still to be eyeballed in a browser.

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
      build option, `protractor`, `tslint`, `codelyzer`, `@clr/icons` **and `@cds/core`** — both
      removed in Clarity 18; `cds-icon`, design tokens and CSS utilities now ship inside
      `@clr/angular`/`@clr/ui`. (`@cds/core` already dropped from `package.json` on 2026-06-26;
      run `npm install` to sync the lockfile when no dev server is holding `node_modules`.)
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
- **Clarity icons → `@clr/angular`** (Phase 4) — different API, not a version bump. Note Clarity
  18 folded `cds-icon` (and tokens/CSS utilities) *into* `@clr/angular`/`@clr/ui` and dropped the
  separate `@cds/core` package, so there's no `@cds/core` dependency to carry.
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
