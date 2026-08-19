# Conventions

Per-file, mechanical coding standards — naming, exports-per-file, component patterns, imports.
These are checkable by inspection or script, independent of any judgment call about *where* a
file lives. For domain placement and folder organization, see
[ARCHITECTURE.md](./ARCHITECTURE.md) instead — that document is the one place placement
decisions get made; this one assumes a file already lives in the right place and asks whether
its shape follows the rules.

The `convention-review` skill enforces this document — `check` mode after a set of changes,
`full` mode for a deliberate sweep — leaning on scripts (`scripts/` under that skill) wherever a
rule reduces to a grep, and agent judgment only where a rule has named exceptions.

## Naming

**`st-` prefix.** Component selectors (`st-…`) and app-specific CSS custom properties
(`--st-…`) use the `st-` prefix, not the generic `app` selector. Token names follow
[TOKEN-SCHEMA.md](./TOKEN-SCHEMA.md). The selector half is enforced by lint
(`@angular-eslint/component-selector` / `directive-selector` in `eslint.config.js`, prefix
`st`) — a violation fails `npm run lint`, not just review. The CSS-custom-property half isn't
lint-checkable (it's Sass, not TypeScript), so `convention-review`'s script greps for it
instead.

## Signals & zoneless

State is signal-based (`signal` / `computed`); components use `input()` / `output()` /
`viewChild()`. No `@Input` / `@Output` / `@ViewChild` decorators and no `zone.js`-era patterns.

## Path aliases

Imports go through the `@…/*` path aliases (see the Alias column in
[ARCHITECTURE.md's project-structure table](./ARCHITECTURE.md#project-structure)) rather than
deep relative paths (`../../../`). Neither barrels nor `index.ts` files are used — imports go
straight to the file that exports the thing.

## File organization

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
- **An interface with the DI token that provides it** (e.g. `GameSetupContext` +
  `GAME_SETUP_CONTEXT`) — the token has no meaning without the type; keep the pair in the
  type's file. Not every contract interface needs a token: `GameSession` has none because
  each plugin's own session service implements it directly and is injected concretely.
- **A component with its dialog/input data contract** (e.g. `ConfirmDialogData` +
  `ConfirmDialogComponent`) — the interface is the component's props, consumed only through
  `DIALOG_DATA` / `input()`.
- **A DTO with its mapping functions** (e.g. `PlayerSnapshot` + `toPlayerSnapshot` /
  `playerFromSnapshot`) — the serialization unit for one type.

Anything not matching a category above splits. When in doubt, split. `max-classes-per-file`
guards the most common regression (multiple classes); the rest is convention.

## Static helper classes

**Pure behavior over a data type lives on a `static` helper class, not loose standalone
functions.** A plain-data model file holds just the type; its construction/formatting/
comparison behavior goes on a sibling `*Helper` class — e.g. `StColor`
(`color/models/st-color.ts`) is paired with `ColorHelper` (`color/models/color-helper.ts`,
`ColorHelper.create` / `hexString` / `sameColor` / …). One `ColorHelper.*` surface is easy to
find when scanning the tree, and the model file stays a clean DTO. (The DTO-mapper exception
above is the one place mapping functions still sit beside their interface — the mappers *are*
that type's serialization contract.)
