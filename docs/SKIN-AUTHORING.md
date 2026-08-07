# Authoring a skin

How to add a skin. What a token is *called* and which layer it belongs to is [TOKEN-SCHEMA.md](./TOKEN-SCHEMA.md); this document is the mechanics.

A **skin** assigns every design token. A **theme** picks light or dark *within* a skin. They are independent axes, and every skin defines both.

---

## 1. What a skin is

One file under `../src/styles/skins`, in three parts:

```scss
[data-skin='glass'] {
  @include ramp.emit('primary', glass-palette.$primary);   // ramps — scheme-invariant
  --st-radius-3: 20px;                                     // primitives
  --st-color-surface-base: var(--st-color-neutral-99);     // semantic — light
}

[data-skin='glass'][data-theme='dark'] {
  --st-color-surface-base: var(--st-color-neutral-10);     // semantic — dark
}
```

Ramps are declared **once** and the two semantic blocks select different stops off them. That halves the values to author and keeps light and dark provably consistent — a dark scheme is a different set of stops, not a different palette.

Both attributes live on `<body>`. That is deliberate: the CDK attaches its overlay container to `<body>`, so dialogs, menus and selects inherit the skin with no extra work.

`classic` is the default and additionally claims `:root`, so an unset `data-skin` still renders. Every other skin claims only its own attribute — a `<body>` declaration beats an inherited `:root` value, so nothing needs `!important` or a specificity fight.

---

## 2. Generate the palette

Hand-picking sixteen tones per intent is neither fast nor accurate. Use Material's generator as a **dev-time tool** — its output is checked-in Sass that outlives the dependency:

```
npx ng generate @angular/material:theme-color \
  --primary-color="#ff00aa" \
  --neutral-color="#7a6a72" \
  --neutral-variant-color="#8a5f78" \
  --error-color="#ff2200" \
  --tertiary-color="#ffea00" \
  --include-high-contrast=false --is-scss=true \
  --directory="scratch/"
```

Then lift the maps you need into `src/styles/skins/_palette.scss` — every skin's ramps live in this one file, not a per-skin file — as a new Sass map per intent, named for what the color *is* rather than which skin or role it backs (a hue name like `$crimson` for a color-bearing ramp, a `neutral-*`-prefixed descriptive name like `$neutral-blue-gray` for a neutral or tint), then delete the scratch directory. The mapping from the generator's names to ours:

| Generator | Ours |
|---|---|
| `primary` | `primary` |
| `neutral` | `neutral` |
| `neutral-variant` | `tint` |
| `error` | `danger` |
| `tertiary` | `accent` — or reuse the slot for `success`, which M3 has no palette for |

`success` has no M3 equivalent, so seed a second run from a green (or whatever the skin means by "gain") and take its `primary` map.

Only emit the intents something consumes. An unused intent is 32 custom properties for nothing, and a legal name with no value is the state the schema describes as intended.

Naming lives in one flat namespace across every skin, so pick a name that's globally unique — `$crimson` for comic's danger ramp, `$scarlet` (or whatever reads as genuinely different) if another skin's ramp needs a second red. This is also what makes the file worth having: every color the app uses is scannable in one place, and reassigning a skin to a different mood is a one-line change to which name its `ramp.emit()` call references (§3), not a file move.

---

## 3. Emit the ramps

`skins/_ramp.scss` does the mechanical part:

```scss
@use 'ramp';
@use 'palette';

[data-skin='glass'] {
  @include ramp.emit('primary', palette.$electric-cyan);
}
```

`emit` writes `--st-color-<intent>-<tone>` for every stop in the map **and** its `--st-color-<intent>-<tone>-contrast` pairing, computed by WCAG relative luminance. Contrast pairing is mandatory (schema rule 5) and there are ~90 stops in a skin — computing it means a ramp cannot ship a mispaired stop. It mirrors `ColorHelper.contrastCssVarValue`, which does the same job at runtime for player colors; keep the two in step if either changes.

---

## 3b. Emit space and font

`skins/_scale.scss` does the same mechanical job for the app's two magnitude scales — space and font — each derived from one per-skin unit:

```scss
@use 'scale';

[data-skin='glass'] {
  @include scale.space($unit: 0.5rem);
  @include scale.font-levels();
}
```

`scale.space` writes `--st-space-unit` and every `--st-space-<size>` as `calc(var(--st-space-unit) * <mult>)`. `scale.font-levels` writes `--st-font-size-unit` and, for each of the seven levels, its `-family` (from the role in the shared table), `-weight`, `-size`, `-line-height`, and shorthand.

Both take their defaults from a shared table, so a skin that wants the identical scale — five of the six do, for font — calls the mixin with no arguments at all. A skin that diverges passes only the deltas:

```scss
// Comic: same sizes as every other skin, bolder weights throughout.
@include scale.font-levels($overrides: (
  display: (weight: 600),
  heading: (weight: 600),
  // …
));

// Pixel: a compressed type range, tuned per level.
@include scale.font-levels($overrides: (
  display: (size: 14, line-height: 18),
  heading: (size: 10, line-height: 14),
  title: (size: 10),
  subtitle: (weight: 700),
  body: (size: 8, line-height: 11),
  label: (weight: 700),
  caption: (size: 7, line-height: 10),
));
```

`--st-font-family-<role>-scale` is a separate, optional lever: a per-family correction for a typeface reading visibly smaller or larger than its peers at the same nominal size (`scale.font-levels` reads it with `1` as its `var()` fallback, so declaring nothing leaves every level unaffected). Set it directly, next to the family declarations it corrects for:

```scss
--st-font-family-base: 'Jersey 20';
--st-font-family-heading: 'Jersey 20';
--st-font-family-heading-scale: 1.3;
--st-font-family-base-scale: 1.3;
```

---

## 4. Select the semantic roles

The semantic layer is what components actually read. Classic's stops are M3's own role→tone assignments, which is a reasonable starting point for a skin that wants a conventional ladder:

| Role | light | dark |
|---|---|---|
| `surface-base` | `neutral-98` | `neutral-6` |
| `surface-sunken` | `tint-90` | `tint-30` |
| `surface-raised` | `neutral-94` | `neutral-12` |
| `surface-overlay` | `neutral-92` | `neutral-17` |
| `text-base` | `neutral-10` | `neutral-90` |
| `text-muted` | `tint-30` | `tint-90` |
| `edge-base` | `tint-50` | `tint-60` |
| `edge-subtle` | `tint-80` | `tint-30` |
| `brand-base` | `primary-40` | `primary-80` |
| `brand-surface` | `primary-40` | `primary-30` |
| `danger-base` / `success-base` | `<intent>-40` | `<intent>-80` |

A skin is free to ignore all of it. The surface ladder names a *structural* relationship — what nests inside what — not a lightness, so a skin may invert or flatten it entirely. Every background role needs its `-contrast` counterpart.

---

## 5. Register it

1. Add the file to `src/styles/skins/_index.scss`. **Order matters**: `classic` first, because it claims `:root`; later skins win ties on source order.
2. Add the name to `SKINS` in `../src/app/core/skin.ts`. The `Skin` union is derived from that array, so there is no second list to update.

The dev-only toggle in the shell header cycles through `SKINS` in order.

---

## 6. Things that will trip you up

**A component token's default never sits on the component's own element.** A skin sits on `<body>` and reaches a component by inheritance, and an inherited value always loses to a declaration on the element itself. If a component declares `--st-shell-color-background` on `.shell`, no skin can ever set it. It goes in one of two places instead — a bare `:root` block in the same file, if the default is a plain literal, or an inline `var(x, var(y))` fallback chain at the read site, if the default is itself another token (moving that one to `:root` would bake in a stale value instead of respecting a skin's override of `y`). See TOKEN-SCHEMA.md §6 for the full rule and why the two cases differ.

**Tokens declared on `:root` outside a skin file are still skinnable.** Motion lives in `_motion.scss` on `:root` because nothing has wanted to skin it yet — but a `<body>` block overrides it fine. "Unskinned" means "not yet overridden", not "out of reach". `_border.scss`'s `--st-border-width-1` and `_tokens.scss`'s radius/shadow/state-opacity ladders are the same pattern with skins that *have* wanted to override them (Chunky Comic, Retro Pixel, Neon Glass all redeclare border width; every skin redeclares radius/shadow/state-opacity) — the files just aren't classic's, even though classic also happens to sit on `:root` (§1). A skin-agnostic default and "the default skin" are different things that happen to share a selector.

**Runtime colors ignore skins by design.** `--st-ctx-*` is a player's chosen color, picked while the app runs, so no skin can set it and no contrast check can verify it. A green player stays green under every skin.

**Contrast on the semantic layer is not checked.** Ramp pairings are computed and therefore safe; the ~6 hand-written semantic pairings are not audited.

**Three font-family roles, not one.** `--st-font-family-base`, `--st-font-family-heading` and `--st-font-family-score` are independent of the font levels (`--st-font-body`, `--st-font-title`, …) — see TOKEN-SCHEMA.md §4. Each level's own `-family` facet defaults to whichever role fits it; most skins set all three roles to the same face. `pixel` is the one skin so far where `score` diverges (`Press Start 2P`, reserved for the two real numeric score-digit readouts); its `heading` deliberately matches `base` (`Jersey 20`) rather than `score` — a dialog title is a text block, not a score, and should stay legible.
