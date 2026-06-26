import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClarityModule } from '@clr/angular';
import { Player } from '@models/player';
import { PlayerColor } from '@models/player-color';
import { NumberPadComponent } from '@util/number-pad/number-pad.component';
import { NumberPickerComponent } from '@util/number-picker/number-picker.component';
import { ColorPickerComponent } from '@util/colors/color-picker/color-picker.component';
import { PlayerSelectionComponent } from '@forms/player-selection/player-selection.component';
import { PlayerScoreComponent } from '@forms/player-score/player-score.component';

/**
 * Throwaway Phase 2 harness: smoke-tests the modal system + number components.
 * Removed once real features (forms, scoring) provide coverage in later phases.
 */
@Component({
  selector: 'st-harness',
  imports: [
    FormsModule,
    ClarityModule,
    NumberPadComponent,
    NumberPickerComponent,
    ColorPickerComponent,
    PlayerSelectionComponent,
    PlayerScoreComponent,
  ],
  templateUrl: './harness.html',
})
export class Harness {
  readonly scores = signal<number[]>([]);
  readonly selectedPlayers = signal<Player[]>([]);
  pickerValue = 0;
  pickedColor: PlayerColor | null = null;

  readonly demoPlayer = Object.assign(new Player(1), {
    name: 'Demo',
    color: new PlayerColor(8, 76, 97),
  });

  addScore(val: number): void {
    this.scores.update((s) => [...s, val]);
  }

  onSelectPlayers(players: Player[]): void {
    this.selectedPlayers.set(players);
  }
}
