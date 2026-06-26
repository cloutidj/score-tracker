import { Component, input } from '@angular/core';
import { PlayerColor } from '@models/player-color';

@Component({
  selector: 'st-color-swatch',
  template: `
    <span
      class="color-swatch"
      [class.active]="active()"
      [class.clickable]="clickable()"
      [style.background-color]="color()?.rgbString()"
    ></span>
  `,
  styleUrl: './color-swatch.component.scss',
})
export class ColorSwatchComponent {
  // Colors may arrive deserialized (plain objects); re-hydrate so rgbString() works.
  readonly color = input(undefined, {
    transform: (val: PlayerColor | undefined) =>
      val ? Object.assign(new PlayerColor(), val) : undefined,
  });
  readonly active = input(false);
  readonly clickable = input(false);
}
