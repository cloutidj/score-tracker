import { Component, input } from '@angular/core';
import { PlayerColor } from '@player/models/player-color';
import { PlayerColorDirective } from '../player-color.directive';

@Component({
  selector: 'st-color-swatch',
  imports: [PlayerColorDirective],
  template: `
    <span
      class="st-color-swatch"
      [class.is-active]="active()"
      [class.is-clickable]="clickable()"
      [stPlayerColor]="color()"
    ></span>
  `,
})
export class ColorSwatchComponent {
  // Colors may arrive deserialized (plain objects); re-hydrate so the helper works.
  readonly color = input(undefined, {
    transform: (val: PlayerColor | undefined) =>
      val ? Object.assign(new PlayerColor(), val) : undefined,
  });
  readonly active = input(false);
  readonly clickable = input(false);
}
