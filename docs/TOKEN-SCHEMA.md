# Design token schema

How the app's design tokens are named, who may read them, and what to do when you need a new one.

This document defines which token **names are legal**, not which ones exist. A legal name with no value assigned is a token nobody has needed yet — not a gap to fill.

---

## 1. The rule everything else serves

> **Nothing outside `src/styles/` reads a color ramp stop.**

Components read semantic colors, the primitive scales that have no semantic layer, and their own component tokens. That single restriction is what makes a skin possible: it lets `--st-color-surface-raised` become a translucent blur under one skin and a flat tone under another without a component changing.

---

## 2. Layers

| Layer | Shape | Says | Set by | Read by |
|---|---|---|---|---|
| **Primitive** | `--st-<category>[-<scale>]-<position>` | *where on a scale* | the skin | `src/styles/`, and components for scales with no semantic layer |
| **Semantic** | `--st-color-<role>-<variant>` | *what it is for* | the skin | anything |
| **Component** | `--st-<component>-<category>-<property>` | *what this part of this component does* | the component; overridable by a skin | that component |
| **Runtime** | `--st-ctx-<name>` | *a value only known while running* | a directive | anything, with a fallback |

The distinction that keeps the first two layers apart:

> **Positions are never named. Roles are never positional.**

`40`, `3`, `2` are positions — they say where something sits on a scale and nothing about its purpose. `raised`, `muted`, `subtle` are roles — they say what a thing is for and nothing about its value. So the final segment tells you the layer, with no lookup required:

```scss
--st-color-neutral-95      // primitive — a tone
--st-color-surface-raised  // semantic  — a purpose
```

---

## 3. Positions

The whole system's position vocabularies. The first three are magnitudes and all run the same way — **later means more**; the rest are enumerations.

| Vocabulary | Values | Used by |
|---|---|---|
| `size` | `xxs xs sm md lg xl xxl` | `space` |
| `level` | `0 1 2 3 4 5` | `radius`, `shadow`, `effect` |
| `speed` | `fast` `base` `slow` | `motion-duration` |
| `tone` | `0 4 6 10 12 17 20 22 24 25 30 35 40 50 60 70 80 87 90 92 94 95 96 98 99 100` | `color` |
| `state` | `hover` `pressed` `focus` `selected` `disabled` | `state` |
| `easing` | `standard` `enter` `exit` | `motion-easing` |

These names label the vocabularies; they are never segments of a token. (`size` also appears as a font facet, `--st-font-body-size`, and as a component-token category, `--st-button-size-height` — different things in different positions.)

**Which vocabulary a category uses is fixed by the category, never by taste.** A category gets the words its own subject is genuinely spoken in, and then every token in that category uses them:

> If **"none" is a step you would actually set**, it is a `level`. If the subject has **natural words of its own**, it uses those. Otherwise it is a `size`.

A flat skin genuinely wants every shadow set to none and every corner square, so `0` is a real, skin-settable position — `radius` and `shadow` are levels. Duration is spoken in speed: `fast` and `slow` say outright what `sm` and `lg` only encode, and they carry none of the ambiguity of "large" (a longer duration, or a bigger movement?). Space has no such vocabulary of its own, so it takes t-shirt sizes, where the words still read better at the call site than a number would. Font is neither — it isn't a magnitude scale at all, just a small closed set of named levels (§4), the same way `state` is an enumeration rather than a position.

This is also what "positions are never named" means in practice — `fast` says *where on the speed scale*, not what the motion is for. A named position is still a position.

A category using only part of its range is normal. Space runs `xs` through `xxl` and has no `xxs` today. The vocabulary defines what is *sayable*, and leaving some of it unsaid costs nothing — whereas letting one category quietly use different words from its neighbours is where drift starts.

`tone` is separate because it is the one scale we do not own: it is the Material 3 tonal scale, which is what `ng generate @angular/material:theme-color` emits, so a generated palette lifts into a skin file as a copy-paste rather than a per-value judgement call. It is listed as **exactly what the generator emits** — including the close-packed stops (`4 6 12 17 22 24 87 92 94 96`) that only the neutral ramp carries, and that a dark scheme's surface ladder is built from. A tighter list would make the copy-paste a judgement call again, which is the one thing this scale exists to avoid.

---

## 4. Primitives

Pure scales. Every position comes from §3.

| Category | Form | Notes |
|---|---|---|
| `color` | `--st-color-<intent>-<tone>[-contrast]` | intent: `primary` `neutral` `tint` `danger` `success` `accent` |
| `space` | `--st-space-<size>` | gaps, padding, margins |
| `radius` | `--st-radius-<level>` | `0` is square, `5` is fully rounded — a pill or a circle |
| `shadow` | `--st-shadow-<level>` | a depth ladder, not an elevation model |
| `effect` | `--st-effect-blur-<level>` | a `backdrop-filter` blur ladder — no M3 equivalent, added for Neon Glass |
| `border` | `--st-border-width-<level>` | a stroke-width ladder — `0` is borderless, same "none is a real step" reasoning as `radius`/`shadow`/`effect` |
| `font` | `--st-font-<level>[-family\|-weight\|-size\|-line-height]` | level: `display` `heading` `title` `subtitle` `body` `label` `caption` — a closed, named vocabulary, not a position; each level is a complete, self-contained definition |
| `font` | `--st-font-family-<role>` | role: `base` `heading` `score` — an open, named vocabulary (like color's intents), not a position |
| `font` | `--st-font-family-<role>-scale` | same roles as above — a unitless correction, not a token most skins set (see below) |
| `motion` | `--st-motion-duration-<speed>`, `--st-motion-easing-<easing>` | duration is spoken in speed, not sizes |
| `state` | `--st-state-opacity-<state>` | how hard to push a fill, not what color |

```scss
--st-color-primary-40
--st-color-primary-40-contrast   // a foreground guaranteed legible on that tone
--st-space-md
--st-radius-5
--st-shadow-2
--st-font-body
--st-font-body-line-height
--st-font-family-base
--st-motion-duration-fast
--st-state-opacity-hover
```

**Color ramps** carry a `-contrast` pairing per stop. Ramps are **scheme-invariant**: a skin declares one set of ramps, and its light and dark semantic blocks select different stops off them. `accent` exists but nothing consumes it — it is the palette Material calls "tertiary", renamed because "tertiary" describes where Material put it rather than what it is for.

**`tint` is the neutral that carries a trace of the identity hue** — same lightness, a little chroma. Compare `neutral-90` `#e0e3e3`, which is nearly hueless, against `tint-90` `#d9e5e6`. It backs sunken surfaces, muted text and edges: the chrome that should sit *near* neutral without being flatly grey. This is the palette Material calls "neutral-variant", renamed for the same reason "tertiary" became `accent` — the Material name says where it was filed, not what the color is.

**A font level is one complete, self-contained definition — family, weight, size, and line-height — never a size scale crossed with a t-shirt suffix.** `title` is a semantic level in its own right (a specific typeface + size + spacing), and "large title" / "small title" isn't a real concept — a genuinely smaller title is a *different* level (`subtitle`), the same way Clarity Design separates headings from content rather than sizing one "heading" token up and down. `--st-font-<level>` is the full `font` shorthand; `-family`, `-weight`, `-size`, `-line-height` are facets that select one component of it, present uniformly on every level so "which facet does this level have" never comes up. There is a fixed, closed set of seven levels — chosen to match what this app actually needs (a score-digit readout is not a heading; a button reads differently from a caption), not modeled on an external type-scale's full range:

```scss
font: var(--st-font-body);
// expands to: font: 400 0.875rem / 1.25rem 'Elms Sans';  — a valid shorthand
line-height: var(--st-font-body-line-height);
```

Three family roles stay independent of the level list: `base` (the skin's normal reading face), `heading` (legal to differ from `base`, e.g. a serif title over a sans body, though most skins set the two identically), and `score` (a thematic/mono face reserved for numeric score displays). Each level's own `-family` facet defaults to whichever role fits it (`display` → `score`; `heading`/`title`/`subtitle` → `heading`; `body`/`label`/`caption` → `base`), composed in once at the skin, but a call site can still override it per-element — a CSS custom property's value is untyped text substituted at the point of use, so overriding `--st-font-body-family` (or plain `font-family`) on a more specific rule changes what `var(--st-font-body)` expands to right there.

**A level's `-size` and `-line-height` are still literal per-skin values — `scale.font-levels` (docs/SKIN-AUTHORING.md §3b) is only how a skin's own file derives them**, the same relationship `--st-space-unit` already has with the space steps: an internal knob plus a shared step table, not a new segment a component ever reads. What it buys is `--st-font-family-<role>-scale` — a typeface's apparent size at a given rem value is its own (two fonts at the same `font-size` can read visibly different sizes depending on how much of the em box their glyphs fill), so this is the single per-family correction for that, applied to every level whose `-family` resolves to that role. It is read with `1` as its `var()` fallback, so a skin sets it only where a swapped typeface actually needs compensating — Pixel is the one skin that does, correcting for Jersey 20 reading smaller than its predecessor at the same nominal size.

**Shadow** is a plain ladder. `0` is no shadow. A skin that expresses depth some other way — a hairline edge, a blur, nothing at all — sets the levels to whatever serves it, including `none`, and reaches for component tokens where the treatment is structural rather than tonal.

**Effect** is a second, independent ladder for `backdrop-filter` blur amounts. It is not folded into `shadow` because a blur radius and a shadow's depth are different physical quantities that a single skin may want to set independently (Neon Glass's glass panels are both blurred *and* shadowed) — and `backdrop-filter` has no shadow-shaped fallback: a skin with no blur sets every level to `0`, the same "none is a real step" reasoning `radius` and `shadow` already use. No skin but Neon Glass has needed a non-zero value yet, which is the "legal name, no value assigned" state the intro describes, not a gap.

**Border** is a third `level` ladder, for stroke width, and the one primitive category whose baseline is declared outside any skin. Before it existed, the three components that draw a border (`surface`, `field`, `button`) each fell back to their own hardcoded pixel literal, so retuning "how thick is a border in this app" meant editing every component and every skin that overrode one. `src/styles/_border.scss` declares the app's one default, `--st-border-width-1: 1px`, on a bare `:root` — the same "declared outside a skin file, still skinnable" pattern `_motion.scss` already uses for duration/easing (docs/SKIN-AUTHORING.md §6). This is deliberately *not* classic's job: classic is a bundle of aesthetic choices that happens to also sit on `:root` for the zero-flash-before-`SkinService` reason (§10), and border width isn't one of its choices — it's the one value genuinely common to every skin until a skin says otherwise. Every bordered component's own fallback chain (`var(--st-button-border-width, var(--st-border-width-1))`) reads that root value through ordinary CSS inheritance if nothing closer overrides it. A skin with no border opinion of its own — Organic Fluid, and classic itself — declares nothing and inherits the 1px unchanged. A skin whose identity includes a real stroke — Chunky Comic's ink border, Retro Pixel's block edge, Neon Glass's hairline — redeclares `--st-border-width-1` (and a second level, if it needs a thicker stop for cards/buttons alongside a thinner one for icon-sized controls) on its own `[data-skin]` block, which — being more specific than a bare `:root` — wins for every element under it regardless of file load order; a component that already matches the new default (Chunky Comic's field, at the same width as its icon buttons) needs no further declaration at all. `0` is as real a step here as it is for `radius`/`shadow` — Soft Neumorphism gives it its own level (`--st-border-width-0`) rather than repurposing `1`, so the one component that never got a width opinion (an outlined button) still inherits the root default instead of silently going borderless too.

`src/styles/_tokens.scss` declares the same "baseline outside any skin file" pattern for `radius`, `shadow` and `--st-state-opacity-*`, on a bare `:root` alongside `_border.scss`. Classic's own values ARE that baseline (it authored them first), so `_classic.scss` declares none of the three itself and inherits them here unchanged — the same relationship it already has with `_border.scss`'s border width. Every other skin is unaffected: each already redeclares its own radius/shadow/state-opacity ladder wholesale on its own `[data-skin]` block, which wins over `:root` the same way border width's override does.

**State** holds interaction strengths, not colors. Keeping them here means a skin retunes every interaction in the app by editing five values.

---

## 5. Semantic colors

```
--st-color-<role>-<variant>[-contrast]
```

**Color is the only category with a semantic layer.** Space, radius, shadow and font levels mean the same thing under every skin — a skin changes their *values*, not their *structure* — so they are consumed as primitives directly. Color is the one dimension where a skin restructures meaning: a glass skin's "raised panel" is not a tone at all.

```scss
// one skin
--st-color-surface-raised: var(--st-color-neutral-95);

// another — same name, structurally not a ramp stop
--st-color-surface-raised: color-mix(in srgb, var(--st-color-neutral-99) 55%, transparent);
```

| Role | Variants | |
|---|---|---|
| `surface` | `base` `sunken` `raised` `overlay` | background fills, ordered by nesting |
| `text` | `base` `muted` | foregrounds that differ from their surface's `-contrast` |
| `edge` | `base` `subtle` | borders, dividers, outlines |
| `primary` | `base` `surface` `active` | the identity color |
| `accent` | `base` | secondary/tertiary highlight, distinct from the identity color |
| `danger` | `base` `surface` | destructive actions, validation failure, loss |
| `success` | `base` `surface` | confirmation, gain |

The surface ladder, in words:

- **`base`** — the page. What `<body>` and full-bleed regions paint.
- **`sunken`** — a small fill *inside* another surface: chips, badges, avatars, wells.
- **`raised`** — cards and panels sitting on the page.
- **`overlay`** — dialogs, menus, and inner panels that must separate from the card behind them.

These name a **structural relationship, not a lightness**, which is what lets them survive a skin that inverts or flattens the whole ladder.

**Foregrounds come from the surface.** Every background role defines a `-contrast` counterpart, and that is the default foreground for anything sitting on it. The `text` role exists for foregrounds that deliberately differ — in practice, `text-muted`.

```scss
.panel {
  background: var(--st-color-surface-raised);
  color: var(--st-color-surface-raised-contrast);
}
.panel .caption {
  color: var(--st-color-text-muted);
}
```

`primary` splits three ways because one teal cannot do all three jobs: `primary-surface` is a large fill that must stay legible in both schemes, `primary-base` is a thin accent that must pop against a dark surface, and `primary-active` is the selected state *on* a primary fill, where `primary-base` would not separate from it. `primary-base` carries a `-contrast` counterpart from the moment it starts backing a fill (a filled button, say) rather than only coloring text or an icon — Rule 5 makes this automatic, not a special case. `danger`/`success`/`accent` get the same `-base-contrast` pairing once the button/icon-button status axis lets any of them back a fill too, not just `primary`.

**Interaction states do not appear at this layer.** They belong to component tokens — §6.

---

## 6. Component tokens

```
--st-<component>[-<part>]-<category>[-<property>][-<state>]
```

```scss
--st-button-color-background
--st-button-color-background-hover
--st-button-color-foreground-disabled
--st-button-filled-color-background
--st-button-space-padding-inline
--st-button-radius
--st-button-border-width
--st-card-shadow-hover
--st-dialog-header-color-background
--st-hp-damage-color-foreground
```

| Slot | Closed? | |
|---|---|---|
| `component` | open | the selector without the `st-` prefix; a variant may be folded in (`button-filled`) |
| `part` | open, optional | a named region inside the component, or a domain concept it owns (`header`, `damage`) |
| `category` | **closed** | `color` `space` `radius` `shadow` `effect` `border` `font` `size` — same words as §4 |
| `property` | **closed**, optional | which aspect of that category |
| `state` | **closed**, optional | the `state` vocabulary from §3 — always last |

The category segment anchors the parse: everything before it names the thing, everything after describes it. Since the category list is closed, a name splits unambiguously without knowing the component.

| Category | Properties |
|---|---|
| `color` | `background` `foreground` `border` `outline` `icon` `accent` |
| `space` | `padding` `padding-inline` `padding-block` `gap` `inset` |
| `size` | `height` `width` `min-height` `min-width` |
| `font` | `label` `value` `caption` |
| `border` | `width` |
| `radius`, `shadow`, `effect` | none — the category is the property |

**Values come from the layer below.** A component token resolves to a semantic role or a primitive level, never a literal:

```scss
:host {
  --st-button-color-background: var(--st-color-primary-surface);
  --st-button-color-background-hover: color-mix(
    in srgb,
    var(--st-color-primary-surface-contrast) calc(var(--st-state-opacity-hover) * 100%),
    var(--st-color-primary-surface)
  );
  --st-button-space-padding-inline: var(--st-space-md);
  --st-button-radius: var(--st-radius-5);
}
```

**A token a skin may set by name never gets its default declared on the component's own bare element.**

```scss
// wrong — the skin can never win
.shell {
  --st-shell-color-background: var(--st-color-surface-base);
  background: var(--st-shell-color-background);
}
```

A skin block sits on `<body>`/`[data-skin='x']` and reaches a component by **inheritance**, and an inherited value always loses to a declaration on the element itself — regardless of selector specificity. So declaring the default on the host silently makes the token unsettable, and §10's promise that a skin may override component tokens by name only holds when the default lives somewhere else. Four forms supply a real default without making that mistake. Which one applies depends on what the default IS, and whether the token varies with a status/variant class on the same element.

**Form 1 — a plain literal (`none`, `transparent`, `40px`, `inherit`) is declared once on a bare `:root`, in the same file as the component that owns the token** — the same pattern `_border.scss`/`_tokens.scss` use for the primitive layer, applied one level up:

```scss
// right — :root is a strictly higher ancestor than .st-button, so any
// declaration closer to it (body, a skin's [data-skin='x'], or .st-button
// itself, per Form 4 below) always wins regardless of file order
:root {
  --st-button-color-background-default: transparent;
}
.st-button {
  --st-button-color-background: var(--st-button-color-background-default);
  background: var(--st-button-color-background);
}
```

**Form 2 — a default that is itself a reference to a skin-scoped token is declared once on a bare `body`, not `:root`, in the same file as the component that owns the token:**

```scss
// right — body is where every skin's [data-skin='x'] block actually
// applies, so a default declared here resolves against whichever skin is
// active
body {
  --st-surface-radius: var(--st-radius-3);
}
.st-surface {
  border-radius: var(--st-surface-radius);
}
```

This looks like it should be safe at `:root` too — `:root` is even higher up, and Form 1 just said higher is safer. It isn't, because `--st-radius-3` is itself skin-scoped: a skin sets it inside its own `[data-skin='x']` block, and only the default skin's block also happens to claim `:root` (§10). A custom property's `var()`s are substituted using the cascade **at the element where the property is specified**, not at the element that inherits it (`_neon.scss`'s file header documents this exact mechanism for `--st-player-color`, which is the runtime instance of the same rule). Declared at `:root`, `--st-surface-radius: var(--st-radius-3)` resolves `--st-radius-3` as seen at `<html>` — the default skin's value — and bakes that in permanently; every other skin's `<body>`-scoped `--st-radius-3` is never consulted, because `<body>` only ever inherits `--st-surface-radius`'s already-*resolved* value, not the unresolved expression. Declared at `body` instead, the same substitution happens one element lower, where every skin's block actually reaches — and the result still loses cleanly to a skin's own `[data-skin='x']` override of `--st-surface-radius` itself, since `[data-skin='x']` outranks a bare `body` on specificity. A literal default (Form 1) has no such live dependency, so it hoists all the way to `:root` safely; a token reference does not, and must stop one level lower. (`_surface.scss` and `_button.scss` both state this same reasoning in a file comment next to their own `body` blocks.)

**Form 3 — an optional override hook with no default of its own stays an inline `var(--a, var(--b))` fallback chain at the reading element**, where `--b` is a token that already has a real default from Form 1 or 2. This is for a hook that most skins never set at all — declaring it a body-level default of its own (Form 2) would mean inventing a value nobody asked for. `.player-tile`'s leader-state radius is this shape:

```scss
.player-tile {
  border-radius: var(--st-tile-radius, var(--st-surface-radius));

  &.is-leader {
    border-radius: var(--st-tile-radius-leader, var(--st-surface-radius));
  }
}
```

Both hops are real, independently-meaningful override points — a skin might want the base tile shape to diverge from `--st-surface-radius` without touching the leader state — so neither collapses into the other, and neither promotes to a body-level default: `--st-tile-radius` (bare, no suffix) is itself the name a skin overrides, read at the same element that names it, which is exactly the shape the "wrong" example at the top of this section warns about if it were declared any other way.

**A fallback chain is at most one hop: `var(--a, var(--b))`, never three deep.** Every link in a longer chain has to be traced separately, and a chain that long is usually carrying a dead link rather than real structure — either an override tier no skin has ever set (delete the tier, fall straight to what it *would* have fallen to), or a terminal term that only repeats a value its own middle term already resolves to unconditionally (delete the redundant repeat). `--st-button-outlined-color-border` was exactly the first case: a per-variant override no skin used, sitting in front of the one token skins actually set (`--st-button-color-border`), in front of the real fallback (`--st-button-status-accent`) — three things to trace to answer "why is this border this color" when the honest answer only ever needed two.

Where the identical one-hop fallback would otherwise be copy-pasted across several reading elements, wrap it in a Sass function so it is written once (`_health-points-tokens.scss`'s `damage()`/`heal()`, each read from both the tile and its own history dialog) — a naming convenience, not a different form.

**Form 4 — a token whose value genuinely depends on a status/variant class the same element also carries gets a real, named default and a real, named value per status, and a compound selector reassigns the live token per status by ordinary specificity.** This is for the case Form 1–3 can't express: not one default, but several equally-real values that only one status class picks between, on the element that carries both classes at once.

```scss
// the live token .st-button paints with — assigned here, read bare, no
// fallback anywhere
.st-button {
  --st-button-color-border: var(--st-button-color-border-default);
  border-color: var(--st-button-color-border);
}

// two classes on the SAME element always outrank the rule above's one
// class, so this wins no matter where it's declared or which file loads
// first
.st-button.st-button-status-danger {
  --st-button-color-border: var(--st-button-color-border-danger);
}
```

`-default`/`-danger`/`-accent`/`-success`/`-muted`/… (an *open* vocabulary, fixed per component by whatever status axis that component defines — `src/app/ui/status/button-status.ts` for buttons — not the closed §3 `state` list) are themselves ordinary Form 1/2 tokens: real values with no per-instance dependency, so a skin overrides one status's color the same way it overrides any other semantic token, by redeclaring that one name:

```scss
[data-skin='comic'] {
  --st-button-color-border-danger: var(--st-color-edge-base);
}
```

The compound selector is only needed where the base rule *also* locally assigns that exact custom property — that's what creates a specificity race to win. A status value nothing else assigns at that element needs no compounding: `status-tokens`' `--st-button-status-accent` is read directly inside `.st-button`'s own paint call but never locally declared there, so a bare `.st-button-status-danger { --st-button-status-accent: …; }` already wins by ordinary cascade — there is no competing declaration at that element to outrank.

**The runtime exception.** A status whose real value is itself per-instance (§7 — reads `--st-player-color`) can't be given a flat, named default the way `-danger`/`-accent`/etc. are — there is no single value to declare, only a live read that must happen at the very element the status class targets. It's computed directly inside the compound selector instead, with its own one-hop fallback (Form 3) for "outside any themed ancestor":

```scss
.st-button.st-button-status-player {
  --st-button-color-border: var(--st-player-color, var(--st-color-primary-base));
}
```

This is the one place a skin overriding a status can't just redeclare a body-level name — there is no body-level name to redeclare — so it targets the component's own compound selector directly instead, under its own `[data-skin='x']`:

```scss
[data-skin='comic'] .st-button.st-button-status-player,
[data-skin='comic'] .st-button.st-button-status-contrast {
  --st-button-color-border: var(--st-color-edge-base);
}
```

This is the one narrow exception to §10's "a skin overrides component tokens by name at `body`": everywhere else, a skin reaches a component by declaring a named token where its default lives and letting inheritance carry it down. Here, because the runtime default has no fixed value to name, the skin has no name to redeclare and must match the component's own selector instead — a narrow exception, not a second general pattern. Watch the specificity when a skin's own override is itself conditional on an ancestor (Neon Glass's `.st-color-themed`): both the untied and the themed form of the override are needed, at the right relative specificity, or the untied one leaks into a themed context and stomps the live read it was meant to leave alone.

**Not every custom property is a component token.** Declare one when a skin should be able to turn that knob. A value used once, internally, is a plain custom property and needs no schema — and declaring it on the host is how you say so. `--st-health-points-game-life-color-background-hover` is deliberately host-declared: it is derived from a surface role and a state opacity, so a skin retunes it by changing *those* rather than by setting it directly.

Domain concepts occupy the `part` slot rather than becoming global roles — `--st-hp-damage-color-foreground`, not `--st-color-damage-base`. One game type's vocabulary has no business in every skin file, and a skin that wants damage to diverge from its general danger color can still override that one token by name.

---

## 7. Runtime tokens

Values no skin can know because they are chosen while the app runs. Today that is the per-player color set by the `stColor` directive:

```scss
--st-player-color            // the entity color of the nearest themed ancestor
--st-player-color-contrast   // legible foreground, chosen by luminance
--st-player-color-hover      // derived in CSS
--st-player-color-pressed
```

They are a separate layer rather than semantic tokens for a concrete reason: they have no static value, so a skin cannot set them and a contrast check cannot verify them.

An element may render outside any themed ancestor, so **every read supplies a fallback**:

```scss
color: var(--st-player-color-contrast, var(--st-color-primary-surface-contrast));
```

`ButtonComponent`/`IconButtonComponent`'s `status="player"` is the one place this layer is opted into by name rather than read directly — see `src/app/ui/status/button-status.ts`.

---

## 8. Rules

1. **Semantic, never literal.** `--st-color-primary-40`, never `--st-color-teal-40`. A name that survives a redesign is correctly named.
2. **Positions are never named; roles are never positional.** The final segment tells you the layer.
3. **A category's position vocabulary is fixed by the category**, never chosen per token. If "none" is a step you would set, it is a `level`; if the subject has natural words of its own, it uses those; otherwise it is a `size`. No token invents a scale its category does not already use.
4. **Nothing outside `src/styles/` reads a color ramp stop.**
5. **Contrast pairing is mandatory.** Every ramp stop and every background role defines its `-contrast` counterpart. Foregrounds and lines do not need one.
6. **Foregrounds come from the enclosing surface's `-contrast`.** `text` is for deliberate divergence.
7. **Interaction states exist only on component tokens.**
8. **Component tokens resolve to base tokens wherever a scale exists** — always for color, font, and depth. A one-off dimension with no scale behind it may be a literal; a color never may. No hex, `rgb()` or `hsl()` outside a skin file.
9. **Names are skin-invariant.** If a token's name must change to author a new skin, the name was wrong.
10. **Tokens live at their narrowest useful scope.** Domain vocabulary goes in a component token's `part` slot, not the global roles.

---

## 9. Adding a token

1. **Try not to.** Does an existing token mean what you mean? A vocabulary people know beats a bigger one nobody can hold in their head.
2. **Pick the layer.** Is it a scale value (primitive), an app-wide purpose (semantic), or one component's knob (component)?
3. **Compose the name from §3–§6.** Every slot except `component` and `part` draws from a closed list.
4. **If no listed word fits, that is the signal.** Either you are naming an implementation detail — in which case it is a plain custom property, not a token — or the vocabulary has a real gap. Widening a list is a deliberate edit to this document, not something to do in passing.
5. **If it is a background, define its `-contrast` in the same change.**
6. **Give it a value from the layer below.** Semantic points at a primitive; component points at a semantic or a primitive.

Renaming works the same way in reverse: introduce the new name, migrate the call sites, delete the old one.

---

## 10. Skins

A skin is one file declaring the primitive ramps and the semantic colors that select from them. Because ramps are scheme-invariant, a skin is one ramp block plus a light and a dark semantic block:

```scss
[data-skin='glass'] {
  /* primitives — this skin's palette */
  --st-color-primary-40: #...;
  --st-color-neutral-99: #...;
  --st-shadow-2: none;

  /* semantic — light */
  --st-color-surface-base: var(--st-color-neutral-99);
  --st-color-surface-raised: color-mix(in srgb, var(--st-color-neutral-99) 55%, transparent);
}

[data-skin='glass'][data-theme='dark'] {
  /* semantic — dark: same names, different stops off the same ramp */
  --st-color-surface-base: var(--st-color-neutral-10);
}
```

**Skin and theme are independent axes.** A skin selects the token values; the theme selects which scheme within that skin. Every skin defines both.

Both axes are attributes on `<body>` — `data-skin` and `data-theme`. That element specifically, because the CDK attaches its overlay container to `<body>`, so dialogs, menus and selects inherit both without any extra plumbing. The **default** skin also claims `:root`, so an unset attribute renders correctly and there is no first-paint flash:

```scss
:root,
[data-skin='classic'] { /* … */ }        // the default skin
[data-skin='glass'] { /* … */ }          // every other skin
[data-skin='glass'][data-theme='dark'] { /* … */ }
```

One consequence worth stating: because the default skin sits on `:root`, a token a skin leaves unset falls back to the default's value rather than to nothing. That is the intended behaviour — but it also means an unchanged element is ambiguous between "this skin didn't set that token" and "this component ignores tokens". A skin written to *prove* the token layer should therefore set everything.

A skin may also override component tokens by name where a design needs a component to behave structurally differently. It never edits a component.

Ramps are generated per skin with `ng generate @angular/material:theme-color` from that skin's source colors, and the output is checked in. Material's palette generation is a dev-time authoring tool here — hand-computing sixteen tones per intent is neither fast nor accurate — and its output is static Sass that outlives the dependency.

---

## 11. Why it is shaped this way

| Decision | Reasoning |
|---|---|
| One position vocabulary per category, assigned by the category rather than by taste | One scale for everything reads badly (`--st-space-3`); a scale invented per *token* is where drift starts. Fixing it per category keeps the choice made once, and lets a category that has real words of its own — duration has `fast`/`slow` — use them instead of being crammed into t-shirt sizes to hit a smaller vocabulary count |
| `size` runs `xxs…xxl`, not `2xs…2xl` | Reads as a word rather than a formula, and sorts alongside the other segments without a digit in the middle of a name |
| Positions are numeric or t-shirt; roles are words | Makes a token's layer readable from its last segment, with no lookup and no prefix noise |
| `tone` is exactly what the generator emits, close-packed stops and all | It is the one scale we do not own, and the point of adopting it wholesale is that a generated palette lifts in without a per-value decision. Trimming it to the round numbers broke that the first time a dark surface ladder needed `neutral-6 / -12 / -17` |
| `tint` is an intent, and is not called `neutral-variant` | Five semantic colors need a neutral carrying a little of the identity hue, and no combination of the other five intents produces one. The Material name describes where Material filed the palette; `tint` describes the color, which is the same objection that renamed `tertiary` to `accent` |
| Only color has a semantic layer | It is the only category whose *structure* a skin restructures. Space and radius levels mean the same thing everywhere; giving them a semantic layer would be indirection with nothing behind it |
| Interaction states only on component tokens | A state is a property of an interactive thing, and interactive things are components. Putting `-hover` on a global surface role invents a hover for something that may never be hovered |
| State-layer strengths are primitives | The one part of "state" that *is* app-wide. Five values retune every interaction at once |
| `shadow` is a numbered ladder, not an elevation model | Depth is the part of a design most likely to be expressed by something other than a shadow. A plain ladder carries the common case without pretending to model the rest |
| Surface ladder names structure, not lightness | `sunken`/`raised`/`overlay` survive a skin that inverts or flattens the ladder; `light`/`dark` would not |
| The `-contrast` suffix at both layers, rather than an `on-` prefix for semantics | One rule instead of two. Slightly clunkier to read, considerably easier to apply |
| Category anchors the component-token parse | Lets `component` and `part` stay open vocabularies — they name real code — while the descriptive half stays closed |
| A skin-settable component token never gets its default declared on the component's own bare element | Found the first time a skin tried to repaint the app background and lost to the component's own declaration. Inheritance loses to a local declaration whatever the specificity, so declaring a skin-settable default there quietly revokes the override §10 promises — true regardless of which of §6's four forms supplies the default instead. Reserving a bare host declaration for "internal knob, not skin-settable" (the paragraph right after the four forms) turns what was an accident into a statement of intent |
| Status/variant overrides compound with the component's own base selector, not a bare status class | Only needed where the base rule locally assigns that same custom property — that's the only case with a specificity race to win, and specificity has to do it because source order can't be trusted once a skin file, a component file, and a future variant might all touch the same property |
| Domain concepts go in the `part` slot | Keeps one game type's language out of every skin file, while leaving it overridable by name |
| One document, no machine-readable copy | The vocabulary fits in two tables. A second copy in JSON would be a second thing to keep in sync, which is the drift this schema exists to prevent |
| `font` is a flat list of named levels, each self-contained, not a scale crossed with a t-shirt size | "Title" is a semantic level in its own right, not a t-shirt-sized `title`; a genuinely smaller title is a different level (`subtitle`), matching how Clarity Design separates headings from content rather than sizing one heading token up and down. Family stays overridable per level (its own `-family` facet, plus the three role primitives), but no longer needs composing at every call site — the level's own shorthand already bundles it, so a call site reads exactly one token |
| `--st-font-size-unit` and the shared step table are an authoring convenience internal to a skin's own file, not a consumer-facing layer | Consumers still read one self-contained `--st-font-<level>` per the row above — nothing outside `src/styles/` gained a new segment to reason about. What changed is how a skin file *derives* the seven levels' numbers, the same trick `--st-space-unit` already used for the space steps: five of the six skins want the identical scale, so writing it once and having them inherit it is less to keep in sync than each hand-copying the same 35 lines |
