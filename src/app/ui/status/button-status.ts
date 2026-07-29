/**
 * Color-family axis shared by {@link ButtonComponent} and {@link IconButtonComponent}
 * (`status`), orthogonal to each component's own `style`/shape input.
 *
 * `player` and `contrast` are the two statuses that read the runtime
 * player-color layer (`--st-player-color[-contrast]`, TOKEN-SCHEMA.md §7) —
 * `player` for a control on a neutral backdrop, `contrast` for one sitting
 * on its own player-colored fill. `primary` is a pinned skin brand color,
 * same shape as `accent`/`success`/`danger`/`muted`: every status except
 * `player`/`contrast` is a fixed semantic color regardless of theming
 * context, because a delete button must stay red no matter what color the
 * player picked — picking up the player color is `player`'s opt-in job, not
 * something any other status does implicitly. See
 * `src/styles/components/_button.scss` for the full per-status breakdown.
 *
 * `.st-on-fill` (a plain template class, not part of this type) is separate:
 * it's pure metadata marking a control whose own backdrop is already
 * painted with a status color, for a skin that wants to react to that
 * structurally (e.g. giving it its own disc). It has no effect on color —
 * `status="contrast"` is what a call site picks for that.
 */
export type ButtonStatus = 'primary' | 'player' | 'contrast' | 'accent' | 'success' | 'danger' | 'muted';
