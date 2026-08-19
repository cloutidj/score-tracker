/**
 * Color-family axis shared by {@link ButtonComponent} and {@link IconButtonComponent}
 * (`status`), orthogonal to each component's own `variant`/shape input — see
 * docs/UI-COMPONENTS.md § Buttons for the full contract.
 */
export type ButtonStatus = 'primary' | 'player' | 'contrast' | 'accent' | 'success' | 'danger' | 'muted';
