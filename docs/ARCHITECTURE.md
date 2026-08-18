# Architecture

ScoreTracker is a score-tracking PWA — Angular 22, standalone components, signals, zoneless change detection, `@angular/cdk` for overlay/a11y primitives, `@ng-icons` (Phosphor set) for icons. No UI component library: every visual component and the token layer that skins it are custom, under `src/app/ui/` and `src/styles/`.

This document is the source of truth for how the app is organized — domain boundaries, folder placement, the plugin system. Keep it accurate, and update it in the same change that makes a rule here wrong. See [Coding conventions](#coding-conventions) below for per-file standards — this document covers *where things live*, not *how an individual file is shaped*.

## Documentation standards

Project docs and code comments follow one standard, kept in [DOCUMENTATION-STANDARDS.md](./DOCUMENTATION-STANDARDS.md) — read it before adding or editing either. The `documentation-cleanup` skill enforces it automatically on new code, and on demand for full sweeps.

## Coding conventions

Per-file coding standards — naming, exports-per-file, component patterns, path aliases — are kept in [CONVENTIONS.md](./CONVENTIONS.md), a separate concern from the structural rules below. The `convention-review` skill enforces it, leaning on a script for the mechanical checks, on new code and on demand for full sweeps.

## Organization

**Organize by functional domain, not by file type at the top level.** Co-locate the components, services, and
models for a feature (see [project structure](#project-structure) below). Within a domain, nest
sub-folders by functional area or when at the base level of a domain, then we can use file type folders (such as providers, 
models, etc.). When a folder has sub-domains and shares components, services, etc. across the boundaries, create  a `_shared/`
folder (sorts to top) for files that cross boundaries across those areas.  Note: _shared is not a catch all, but a real purpose of
creating shared content across functional domains.

**A component belongs in `ui/` only if it has, or is clearly meant to have, more than one
independent consumer across domains.** Check actual import/consumer count in the tree — not
the component's own docblock, not how reusable its implementation *could* be, and not where
the [project-structure table](#project-structure) below currently lists it (that table records
current contents, not a placement verdict, and can drift just like the code). The true intent
of the component is the driving factor, a pure UI component may only be used once, but should still
be placed with UI components to aide future discoverability. A single-instance component that
is coupled to the domain logic or structure belongs with that domain.

This section is the standing home for structural design rules — how the tree is divided, what
belongs where, and why — and is expected to grow as new cases get settled. Grow it by adding
*rules*, stated generally enough to judge a case nobody has hit yet — not worked examples pinned
to today's specific files. A worked example reads as a verdict on that file's current placement;
once it's written down, drift in that exact file becomes invisible, because everyone re-reads
the doc's own example as confirmation instead of re-checking the file against the rule. If a case
seems worth recording, write the pattern it illustrates, not the filename. `architecture-review`
checks against it — re-derive every rule above against the tree as it is now, including files
that already look settled; a component's current folder is a record of where someone put it at
some point, never evidence for where it belongs.

## Project structure

```
src/app/
  core/
  ui/
  color/
  player/
  game/
    framework/
    types/
  pages/
  shell/
    panels/
```

| Folder            | Alias           | Contains                                                                                                                                            | Docs |
| ------------------ | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| `core/`            | `@core/*`       | app-wide singletons + pure helpers: database, panel/, skin/, theme, last-game-type services; focus/ helpers; icon-library; animations/                | |
| `ui/`              | `@ui/*`         | shared presentational components (no domain knowledge): number-pad/picker/dialog, confirm-dialog, dialog, form-field, select, button, toggle-icon, toggle-icon-button, … | [UI-COMPONENTS.md](./UI-COMPONENTS.md) |
| `color/`           | `@color/*`      | COLOR DOMAIN — StColor model + pure helpers, ColorHelper, the palette + COLOR_LIST token, color-picker/swatch UI, stColor directive                   | [COLOR.md](./COLOR.md) |
| `player/`          | `@player/*`     | PLAYER DOMAIN — models, the default-player-count token, saved-player service + UI, player forms (info/selection)                                     | |
| `game/framework/`  | `@game/*`       | GameType/GameSession contracts, registry, session store, setup context (domain only, no views)                                                        | |
| `game/types/`      | `@game-types/*` | GAME-TYPE PLUGINS — one self-contained GameType each: per-round-scoring/ (incl. its player-score view), free-form-scoring/, end-game-scoring/, health-points/, plus `_shared/` for models/components/services used across more than one plugin (score-track, history-entry-actions, new-game-confirm, axis/leader-state/entry-list helpers) | |
| `pages/`           | —               | ROUTED DESTINATIONS — the components the router-outlet mounts: app-entry/ (redirects to the last-played game or opens Home), play/ (the play-host)    | |
| `shell/`           | —               | CHROME — bottom-nav (the 4 nav buttons), panel-host (renders whichever panel is open), `panels/` (the panel bodies without a stronger domain home: home-panel, styles-panel, calculator-panel), plus update-toast | |

## Game-type plugin system

A game type is a self-contained plugin. The `game/framework` contracts + registry own persistence and descriptor resolution; the `pages/play` host runs the setup → game flow; each plugin in `game/types` supplies only its own setup/game UI and session logic. The contracts are one per file — [`game/framework/game-type.ts`](../src/app/game/framework/game-type.ts), [`game/framework/game-session.ts`](../src/app/game/framework/game-session.ts), and [`game/framework/game-setup-context.ts`](../src/app/game/framework/game-setup-context.ts):

- **`GameType`** (with `GAME_TYPE`) — describes a type to the core: `id` (the `/play/:gameType` route segment and persistence-key namespace), Home-card metadata, the `gameComponent` (and optional
  `setupComponent`), and the `createSession` / `restoreSession` factories.
- **`GameSession`** (no DI token) — the live state of one game, owned by the type. The core (`PlayHostComponent`) treats it as a black box: gates the UI on `gameInitialized`, persists via `toSnapshot()` / `fromSnapshot()`, calls `reset()` on it. The core assumes **neither rounds nor turns** — those live inside a concrete session. A plugin's own session service implements `GameSession` directly, so its `gameComponent` gets `reset()` etc. by injecting that concrete service like any other dependency — the core only needs the interface for its own polymorphic handling and never injects one into the plugin.
- **`GameSetupContext`** (with `GAME_SETUP_CONTEXT`) — supplied to an optional `setupComponent` so it can `start(players, config)` once its self-owned setup screen is complete.

Registration is declarative in [`app.config.ts`](../src/app/app.config.ts): `{ provide: GAME_TYPE, useValue: myGameType, multi: true }`. `GameTypeRegistry` reads the multi
token, so adding a type never edits the registry. The single `play/:gameType` route resolves the descriptor by id and runs setup → game, wiring persistence through `GameSessionStore`.

### Adding a game type

1. Add a folder under `game/types/<your-type>/`.
2. Implement a `GameSession` (typically a signal service) and a game component that injects that concrete service.
3. Export a `GameType` descriptor with metadata + `createSession` / `restoreSession`; register its Home-panel card glyph in [`core/icon-library.ts`](../src/app/core/icon-library.ts).
4. Register it with one `GAME_TYPE` multi-provider line in `app.config.ts`.

Routing, the Home panel's card, resume-on-refresh, and the panel-host overlay come for free.

## Key systems

### Persistence

`GameSessionStore` saves a live session's snapshot (namespaced by game-type id) on every change and clears it when the game ends, over the `core/` `DatabaseService` key/value primitive. Snapshot *shape* stays the concrete session's business — the snapshot is plain and JSON-safe because the runtime state is class instances whose methods don't survive `JSON.parse`, so each session flattens to primitives in `toSnapshot()` and rebuilds in `fromSnapshot()`. State that must round-trip (e.g. the current player) is keyed by index/id rather than by object reference.

### Theming

The style system lives in [`src/styles/`](../src/styles): the skins that assign every token, player colors, motion, and style-only components under `styles/components/`. There is no UI component library backing any of it — `src/app/` reads `--st-*` tokens only.

**Token naming and layering is defined in [TOKEN-SCHEMA.md](./TOKEN-SCHEMA.md)** — what a token is called, which layer it belongs to, and how to add one.

Four structural details that belong to the app rather than the schema:

- **Skins own the token values, and every token comes from one.** `src/styles/skins/` holds one file per skin, each declaring its own color ramps (generated, checked in) and the semantic roles selected off them. `classic` is the default and also claims `:root`, so an unset attribute renders correctly. Ramps are generated with `ng generate @angular/material:theme-color` (a dev-time authoring tool only — see TOKEN-SCHEMA.md) and the output is checked in as static Sass.
- **Skin and theme are two independent axes**, carried as `data-skin` and `data-theme` on `<body>` by `SkinService` and `ThemeService`. `<body>` specifically: the CDK attaches its overlay container there, so dialogs, menus and selects inherit both. The default `data-skin` also ships in `index.html`, so it is right from parse time.
- **One space unit anchors spacing app-wide.** `--st-space-unit` and the `--st-space-<size>` ladder derived from it (`tools/_scale.scss`'s `space` mixin) are declared once as a baseline in `_tokens.scss`, the same "common until a skin says otherwise" pattern `_border.scss` uses for border width — no skin has wanted a different density yet, so none currently overrides it.
- **The app's own chrome is custom components.** `ButtonComponent`/`IconButtonComponent` (`src/app/ui/button/` — see [UI-COMPONENTS.md](./UI-COMPONENTS.md) for their shared contract), `.st-surface`/`.st-tile-grid` (`src/styles/components/`), and navigation via a bottom nav (`shell/bottom-nav/`) plus the panels it opens — there is no top toolbar. Each reads component tokens with a `var(--st-token, default)` fallback rather than a host declaration, which is what keeps them skin-settable — see TOKEN-SCHEMA.md §6.

### Motion

Route changes use the View Transitions API, driven by `core/animations/` and an `animationLevel` set per route. The bottom nav and the update toast sit outside `.route-host` entirely (the toast is `position: fixed`; the bottom nav is a flex sibling), so neither needs a `view-transition-name` to stay put while the page content slides beneath them.
