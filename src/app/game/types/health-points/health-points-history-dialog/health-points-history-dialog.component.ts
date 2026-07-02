import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { NgIcon } from '@ng-icons/core';
import { Player } from '@player/models/player';
import { NumberDialogService } from '@ui/number-dialog/number-dialog.service';
import { ColorDirective } from '@color/color.directive';
import { HealthPointsService } from '../health-points.service';

export interface HealthPointsHistoryData {
  player: Player;
}

/**
 * Per-player life history: every change as damage (red) or heal (green) with the life it left the
 * player on, newest first — so a mistaken quick tap (or a double-tap) can be corrected or removed
 * rather than lost. Reads the live session reactively (by player number) so edits/removals reflect
 * immediately and the tiles recompute through the same signal.
 */
@Component({
  selector: 'st-health-points-history-dialog',
  imports: [MatButtonModule, MatDialogModule, NgIcon, ColorDirective],
  templateUrl: './health-points-history-dialog.component.html',
  styleUrl: './health-points-history-dialog.component.scss',
})
export class HealthPointsHistoryDialogComponent {
  readonly data = inject<HealthPointsHistoryData>(MAT_DIALOG_DATA);
  private readonly gameService = inject(HealthPointsService);
  private readonly numberDialog = inject(NumberDialogService);

  /** This player's live state, looked up by number so it survives signal replacements. */
  readonly state = computed(
    () =>
      this.gameService
        .players()
        .find((p) => p.player.playerNumber === this.data.player.playerNumber) ?? null,
  );

  /** Each change with the running life it produced, newest first. */
  readonly rows = computed(() => {
    const state = this.state();
    if (!state) {
      return [];
    }
    let running = state.startingLife;
    return state
      .entries()
      .map((delta, index) => {
        running += delta;
        return { index, delta, runningLife: running };
      })
      .reverse();
  });

  /** Correct a past change; the keypad's +/- toggle keeps damage vs heal editable in one place. */
  editEntry(index: number, current: number): void {
    this.numberDialog
      .prompt({ player: this.data.player, action: 'Edit Change', value: current })
      .subscribe((value) => this.gameService.editEntry(this.data.player, index, value));
  }

  removeEntry(index: number): void {
    this.gameService.removeEntry(this.data.player, index);
  }
}
