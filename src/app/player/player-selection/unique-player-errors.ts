import { ValidationError } from '@angular/forms/signals';
import { Player } from '@player/models/player';
import { ColorHelper } from '@color/models/color-helper';

/** Cross-field rule: every player must have a unique name and a unique color. */
export function uniquePlayerErrors(players: Player[]): ValidationError.WithoutFieldTree[] {
  let duplicateName = false;
  let duplicateColor = false;

  players.forEach((player, i) => {
    players.forEach((other, j) => {
      if (i === j) {
        return;
      }
      if (player.name && other.name === player.name) {
        duplicateName = true;
      }
      if (player.color && ColorHelper.sameColor(other.color, player.color)) {
        duplicateColor = true;
      }
    });
  });

  const errors: ValidationError.WithoutFieldTree[] = [];
  if (duplicateName) {
    errors.push({ kind: 'duplicateName', message: 'All player names must be unique' });
  }
  if (duplicateColor) {
    errors.push({ kind: 'duplicateColor', message: 'All player colors must be unique' });
  }
  return errors;
}
