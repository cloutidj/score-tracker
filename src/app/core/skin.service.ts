import { Injectable, signal } from '@angular/core';
import { Skin, SKINS } from '@core/skin';

const STORAGE_KEY = 'st-skin';
const SKIN_ATTRIBUTE = 'data-skin';

/**
 * Controls which skin paints the app. A skin assigns every design token — see
 * docs/SKIN-AUTHORING.md — and `src/styles/skins/` selects on the `data-skin`
 * attribute this service sets on `<body>`.
 *
 * Skin and theme are independent axes: this picks the token *values*,
 * {@link ThemeService} picks which scheme within them. Both attributes live on
 * `<body>` because the CDK attaches its overlay container there, so dialogs,
 * menus and selects inherit them with no extra plumbing.
 *
 * `index.html` ships the default `data-skin` in the markup, so the attribute is
 * already correct at parse time and this service only has to overwrite it for
 * someone whose saved skin is something else.
 */
@Injectable({ providedIn: 'root' })
export class SkinService {
  private readonly _skin = signal<Skin>(this.resolveInitialSkin());

  /** The currently active skin. */
  readonly skin = this._skin.asReadonly();

  initialize(): void {
    this.apply(this._skin());
  }

  /** Choose a skin directly. Backs the user-facing Styles panel. */
  select(skin: Skin): void {
    this.set(skin);
  }

  private set(skin: Skin): void {
    this._skin.set(skin);
    localStorage.setItem(STORAGE_KEY, skin);
    this.apply(skin);
  }

  private apply(skin: Skin): void {
    document.body.setAttribute(SKIN_ATTRIBUTE, skin);
  }

  private resolveInitialSkin(): Skin {
    const saved = localStorage.getItem(STORAGE_KEY);
    // A skin that has since been deleted would otherwise leave the app on an
    // attribute no stylesheet matches — which renders as the default anyway, but
    // with the toggle out of step with what is on screen. Fall back explicitly.
    return SKINS.includes(saved as Skin) ? (saved as Skin) : SKINS[0];
  }
}
