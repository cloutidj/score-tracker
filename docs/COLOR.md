# Color

Model, palette, and runtime theming for the `color/` domain ([`src/app/color/`](../src/app/color)). See [ARCHITECTURE.md](./ARCHITECTURE.md) for where `color/` sits in the project structure, and [TOKEN-SCHEMA.md](./TOKEN-SCHEMA.md) §7 for the runtime token layer this domain feeds.

## Model

`StColor` (`models/st-color.ts`) is plain JSON-safe data (`red`/`green`/`blue`/`name?`) — no methods, so a color read back from storage (`JSON.parse`) is already fully usable with no rehydration step. All behavior — construction, formatting, comparison, luminance — lives on the sibling static helper `ColorHelper` (`models/color-helper.ts`), giving one discoverable `ColorHelper.*` surface instead of loose functions.

`color-list.ts` exports the canonical preset palette as `COLOR_LIST` (an `InjectionToken<StColor[]>`), consumed by the picker. A custom color (not from the preset list) is still a plain `StColor`; `ColorHelper.sameColor` compares by RGB value rather than reference so a deserialized custom color can still match a preset swatch of the same value.

## Runtime theming

A player's color is applied to the DOM via `ColorDirective` (`[stColor]`), which sets two CSS custom properties on its host and reads no others:

```
--st-player-color            // ColorHelper.cssVarValue(color)
--st-player-color-contrast   // ColorHelper.contrastCssVarValue(color)
```

`contrastCssVarValue` picks black or white by WCAG relative luminance (crossover at 0.179, where the contrast ratio against black equals the ratio against white) — no per-color tuning needed for the preset palette or a custom color.

The directive also adds `.st-color-themed`. `src/styles/_player-color.scss` matches that class and derives `--st-player-color-hover`/`-pressed` from `--st-player-color` via `color-mix()`, using the app's shared state-layer opacities. Everything downstream — buttons, tiles, swatches — reads `var(--st-player-color*)` only, so changing a player's color is a single swap at the directive; no consumer recomputes anything.

```mermaid
flowchart LR
    A[stColor directive] -->|sets| B["--st-player-color
    --st-player-color-contrast"]
    B -->|".st-color-themed
    color-mix() in _player-color.scss"| C["--st-player-color-hover
    --st-player-color-pressed"]
    B --> D[Buttons, tiles, swatches
    read var(--st-player-color*)]
    C --> D
```

## Picker and swatch UI

`ColorSwatchComponent` (`color-swatch/`) is a single themed dot — it applies `stColor` and nothing else. Its `[active]`/`[clickable]` inputs support a static, non-interactive display as well as the picker's clickable grid, though today `ColorPickerComponent`'s grid is its only consumer.

`ColorPickerComponent` (`color-picker/`) is a `FormValueControl<StColor | null>` — an icon-button trigger that opens a CDK overlay grid of swatches from `COLOR_LIST`. Notable behavior:

- The trigger shows a palette icon, not the selected color, because the *caller* (e.g. a player row) already repaints itself in the chosen color — a swatch on the trigger would just duplicate that.
- Swatches carry no name label in the grid; the color itself is the affordance. `ColorHelper.label` (name, or hex fallback) is used for each swatch's `aria-label` instead.
- Active-swatch matching uses `ColorHelper.sameColor` (value, not identity), so a value round-tripped through storage still highlights the right swatch.
