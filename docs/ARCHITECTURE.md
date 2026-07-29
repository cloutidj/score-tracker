# Architecture

ScoreTracker is a score-tracking PWA — Angular 22, standalone components, signals, zoneless change detection, `@angular/cdk` for overlay/a11y primitives, `@ng-icons` (Phosphor set) for icons. No UI component library: every visual component and the token layer that skins it are custom, under `src/app/ui/` and `src/styles/`.

This document is the source of truth for how the app is organized and the conventions every contributor follows. Keep it accurate, and update it in the same change that makes a rule here wrong.

## Documentation standards

- **Short, succinct, to the point.** Document the *why* and the non-obvious; let the code show the *what*. Prefer a present-tense sentence over a paragraph of history.
- **One concern per document.** When a doc grows large, split it by domain (`docs/<domain>.md`) rather than letting one file sprawl.
- **Docs are a development guide.** New work matches the structure and conventions here; consistency of approach and goals is the point.

### Code comments

Same standard as docs, applied inline:

- **Comment the *why*, never the *what*.** Well-named code already shows what it does; a comment earns its place by carrying a non-obvious constraint, invariant, or trade-off a reader couldn't derive from the code itself. If removing it wouldn't confuse anyone, don't write it.
- **Present tense, no history.** Describe the code as it is. Don't narrate what it used to do, reference a migration in progress, or point at "the regression this fixed" — that context belongs in the commit message, not the source.
- **One JSDoc block per exported member, sized to the need.** A one-line `/** ... */` is the default; let it grow only when the rationale genuinely doesn't fit in a sentence (see `scoring-engine.ts`'s two-pass explanation for a justified example).
- **Consolidate, don't repeat.** When the same rationale would otherwise appear in several places (e.g. a CSS cascade quirk explained at every call site), state it once and have the rest cross-reference it by file/section rather than restating it.
- **Large or cross-cutting rationale belongs in `docs/`, not a comment block.** If a comment needs several paragraphs to explain a subsystem, that's a sign it should be a doc section with a short pointer left in the code.

## Conventions

- **Organize by functional domain, not by file type.** Co-locate the components, services, and models for a feature (see structure below). Within a domain, nest sub-folders by functional area, with a `_shared/` folder (sorts to top) for models/helpers used across those areas.
- **One exported type per file** (see [File organization](#file-organization) for the rule and its exceptions).
- **Signals & zoneless.** State is signal-based (`signal` / `computed`); components use `input()` / `output()` / `viewChild()`. No `@Input` / `@Output` / `@ViewChild`  decorators and no `zone.js`-era patterns.
- **`st-` prefix.** Component selectors (`st-…`) and app-specific CSS custom properties (`--st-…`) use the `st-` prefix, not the generic `app` selector. Token names follow [TOKEN-SCHEMA.md](./TOKEN-SCHEMA.md).
- **Path aliases over deep relative imports** (table below).

### File organization

**One exported type per file — split by default.** Each exported `class` / `interface` /
`type` / `enum` / standalone `function` / `const` gets its own file, named for it. This keeps
classes, functions, and types easy to find by name. Non-exported, file-private helpers stay
with the one exported member that uses them — they are implementation detail, not something
searched for across the app.

An exception (keep multiple members in one file) is allowed only when they form **one cohesive
unit** you would never look for separately:

- **A discriminated union with its variants — *unless* each variant carries dedicated
  behavior.** A pure data union stays in one file (splitting obscures the closed set). But when
  every variant has behavior that naturally pairs with it (as `ScoringRule`'s variants each
  have a `RuleHandler`), **vertical-slice by variant**: put each variant interface with its
  handler in one file, and let the union declaration and the handler registry become small
  aggregator files that import the variants.
- **An interface with the DI token that provides it** (e.g. `GameSession` + `GAME_SESSION`) —
  the token has no meaning without the type; keep the pair in the type's file.
- **A component with its dialog/input data contract** (e.g. `ConfirmDialogData` +
  `ConfirmDialogComponent`) — the interface is the component's props, consumed only through
  `DIALOG_DATA` / `input()`.
- **A DTO with its mapping functions** (e.g. `PlayerSnapshot` + `toPlayerSnapshot` /
  `playerFromSnapshot`) — the serialization unit for one type.

Anything not matching a category above splits. When in doubt, split. `max-classes-per-file`
guards the most common regression (multiple classes); the rest is convention. Neither barrels
nor `index.ts` files are used — imports go through the `@…/*` path aliases straight to files.

**Pure behavior over a data type lives on a `static` helper class, not loose standalone
functions.** A plain-data model file holds just the type; its construction/formatting/
comparison behavior goes on a sibling `*Helper` class — e.g. `StColor`
(`color/models/st-color.ts`) is paired with `ColorHelper` (`color/models/color-helper.ts`,
`ColorHelper.create` / `hexString` / `sameColor` / …). One `ColorHelper.*` surface is easy to
find when scanning the tree, and the model file stays a clean DTO. (The DTO-mapper exception
above is the one place mapping functions still sit beside their interface — the mappers *are*
that type's serialization contract.)

## Project structure

```
src/app/
  core/          app-wide singletons + pure helpers database, panel, theme, skin services; injection tokens; icon-library; animations/
  ui/            shared presentational components (no domain knowledge) number-pad/picker/dialog, confirm-dialog, panel-host, toggle-icon-button, …
  color/         COLOR DOMAIN — StColor model + pure helpers, ColorHelper, the palette + COLOR_LIST token, color-picker/swatch UI, stColor directive
  player/        PLAYER DOMAIN — models, saved-player service + UI, player forms (info/score/selection)
  game/          GAME-TYPE SYSTEM
    framework/     GameType/GameSession contracts, registry, session store, setup context (domain only, no views)
    types/         GAME-TYPE PLUGINS — one self-contained GameType each per-round-scoring/, free-form-scoring/, end-game-scoring/
  pages/         ROUTED DESTINATIONS — the components the router-outlet mounts app-entry/ (redirects to the last-played game or opens Home), play/ (the play-host)
  shell/         CHROME — bottom-nav (the 4 nav buttons) and the panel bodies it opens: home-panel, styles-panel, plus update-toast and toggle-icon-button
```

| Alias           | Resolves to            | Holds                                     |
| --------------- | ---------------------- | ----------------------------------------- |
| `@core/*`       | `src/app/core/*`       | app-wide services + helpers               |
| `@ui/*`         | `src/app/ui/*`         | shared presentational components          |
| `@color/*`      | `src/app/color/*`      | the color model, helpers, palette + UI    |
| `@player/*`     | `src/app/player/*`     | the player domain                         |
| `@game/*`       | `src/app/game/framework/*` | the game-type framework (contracts, registry, store) |
| `@game-types/*` | `src/app/game/types/*` | the concrete game-type plugins            |

## Game-type plugin system

A game type is a self-contained plugin. The `game/framework` contracts + registry own persistence and descriptor resolution; the `pages/play` host runs the setup → game flow; each plugin in `game/types` supplies only its own setup/game UI and session logic. The contracts are one per file — [`game/framework/game-type.ts`](../src/app/game/framework/game-type.ts), [`game/framework/game-session.ts`](../src/app/game/framework/game-session.ts), and [`game/framework/game-setup-context.ts`](../src/app/game/framework/game-setup-context.ts), each pairing its interface with its DI token:

- **`GameType`** (with `GAME_TYPE`) — describes a type to the core: `id` (the `/play/:gameType` route segment and persistence-key namespace), Home-card metadata, the `gameComponent` (and optional
  `setupComponent`), and the `createSession` / `restoreSession` factories.
- **`GameSession`** (with `GAME_SESSION`) — the live state of one game, owned by the type. The core treats it as a black box: gates the UI on `gameInitialized`, persists via `toSnapshot()` / `fromSnapshot()`, ends it with `reset()`. The core assumes **neither rounds nor turns** — those live inside a concrete session.
- **`GameSetupContext`** (with `GAME_SETUP_CONTEXT`) — supplied to an optional `setupComponent` so it can `start(players, config)` once its self-owned setup screen is complete.

Registration is declarative in [`app.config.ts`](../src/app/app.config.ts): `{ provide: GAME_TYPE, useValue: myGameType, multi: true }`. `GameTypeRegistry` reads the multi
token, so adding a type never edits the registry. The single `play/:gameType` route resolves the descriptor by id and runs setup → game, wiring persistence through `GameSessionStore`.

### Adding a game type

1. Add a folder under `game/types/<your-type>/`.
2. Implement a `GameSession` (typically a signal service) and a game component that injects `GAME_SESSION`.
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
- **Density anchors spacing.** `$density` is a per-skin Sass compile-time knob (`skins/_classic.scss`) with no CSS variable; the spacing scale derives from it, so a density change reflows layout everywhere at once.
- **The app's own chrome is custom components.** `ButtonComponent`/`IconButtonComponent` (`src/app/ui/button/`, `ui/icon-button/`), `.st-surface`/`.st-tile-grid` (`src/styles/components/`), and navigation via a bottom nav (`shell/bottom-nav/`) plus the panels it opens — there is no top toolbar. Each reads component tokens with a `var(--st-token, default)` fallback rather than a host declaration, which is what keeps them skin-settable — see TOKEN-SCHEMA.md §6.

### Motion

Route changes use the View Transitions API, driven by `core/animations/` and an `animationLevel` set per route. The bottom nav and the update toast sit outside `.route-host` entirely (the toast is `position: fixed`; the bottom nav is a flex sibling), so neither needs a `view-transition-name` to stay put while the page content slides beneath them.
