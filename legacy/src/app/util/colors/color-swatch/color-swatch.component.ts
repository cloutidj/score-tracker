import { PlayerColor } from '@models/player-color';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'st-color-swatch',
  template: `
    <span class="color-swatch"
        [ngClass]="{'active': active, 'clickable': clickable}"
        [ngStyle]="{'background-color': color?.rgbString()}"></span>`,
  styleUrls: ['./color-swatch.component.scss']
})
export class ColorSwatchComponent {
  private _color: PlayerColor;
  @Input() set color(val: PlayerColor) {
    this._color = Object.assign(new PlayerColor(), val);
  }
  get color(): PlayerColor {
    return this._color;
  }

  @Input() active: boolean;
  @Input() clickable: boolean;
}
