# UI components

Shared contracts for the presentational components in [`src/app/ui/`](../src/app/ui). See [ARCHITECTURE.md](./ARCHITECTURE.md) for where `ui/` sits in the project structure, and [TOKEN-SCHEMA.md](./TOKEN-SCHEMA.md) for how these components' styling hooks are named.

## Buttons

`ButtonComponent` and `IconButtonComponent` (both `ui/button/`) are attribute-selector directives — call sites stay a plain `<button>`/`<a>`, and `stButton`/`stIconButton` only add the classes theming reads. An icon button IS a button: both emit the exact same `st-button-<variant>`/`st-button-status-<status>` classes off two independent inputs, so swapping one component for the other with the same inputs never changes color — `st-icon-button` only ever layers shape (square size, padding, border width) on top, never a second color mechanism. Full per-status styling lives in `src/styles/components/_button.scss`; token mechanics in [TOKEN-SCHEMA.md](./TOKEN-SCHEMA.md) §6.

- **`variant`** (the `stButton`/`stIconButton` value) picks shape/fill. **`status`** (see [`ButtonStatus`](../src/app/ui/button/button-status.ts)) picks the color family, independent of `variant`. Both default to `text` / `primary`.
- `primary`/`accent`/`success`/`danger`/`muted` are fixed semantic colors regardless of theming context — a delete button stays red no matter the player's color. `player` and `contrast` are the two statuses that read the runtime player-color layer (TOKEN-SCHEMA.md §7): `player` for a control on a neutral backdrop, `contrast` for one sitting on its own player-colored fill — pair `contrast` with the plain `st-on-fill` template class, separate metadata some skins react to structurally (e.g. giving it its own disc) but with no color effect of its own.
- An icon button's traditional quiet-toolbar-glyph look is `status="muted"`, set explicitly — not what a bare, status-less icon button renders. Most icon buttons in this app want that look, so most call sites set it.
- **`aria-label` is always the call site's job** — nothing in either component can invent an accessible name for a button whose only content is a decorative glyph.

## Number pad

`NumberPadComponent` (`ui/number-entry/number-pad/`) can tally a score from parts as well as enter one plain number.

- Scores are often built from parts (6 + 8 + 12 + 3): `+` banks the buffer onto a running tally (`parts`) and Enter emits the total (`total`). There's no mode to switch — `+` is just another key, and the expression line sits empty until it's used, so entering one plain number is exactly the taps it always was.
- The tally is text spanning the host's full width, not the narrow key grid, so a whole sum fits on one line; delete is digit-level only — a mis-tapped tally is cheap to cancel and re-enter, and per-part delete would need tap targets too wide to show at all. The expression line is always laid out so banking a part never reflows the pad mid-tally.
- `showEnter=false` (the Calculator panel, which has nothing to commit a value *to*) merges the `+`/Enter pair into one key that's styled like Enter but banks like `+` — `enter` never fires, since clearing the tally there would throw away the only thing the panel is for.

## Common Issues / Troubleshooting

### Native `<select>` doesn't reliably follow the app theme

A native `<select>`'s open option list is a UA popup outside the page's own render tree. On at least this app's Windows/Chrome combination it does not reliably follow the page's dark/light theme — confirmed by direct comparison (two different selects, identical computed `color-scheme`, one rendering the popup dark and the other not) after ruling out every code-level explanation (Angular binding order, DOM ancestry/overlay nesting, load-vs-runtime theme timing). Nothing in app code can fix a UA popup's own rendering, so `SelectComponent` (`ui/select/`) renders its own listbox via `cdkConnectedOverlay` instead — ordinary DOM, so it themes correctly, the same pattern used by the player color-picker menu (`st-color-picker`).
