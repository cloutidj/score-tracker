import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { NgIcon } from '@ng-icons/core';
import { Player } from '@player/models/player';
import { ConfirmService } from '@ui/confirm-dialog/confirm.service';
import { NumberDialogService } from '@ui/number-dialog/number-dialog.service';
import { ColorDirective } from '@color/color.directive';
import { HealthPointsService } from '../health-points.service';
import {
  HealthPointsHistoryData,
  HealthPointsHistoryDialogComponent,
} from '../health-points-history-dialog/health-points-history-dialog.component';

/**
 * Health-points game view: a tile per player (a player-colored header over a neutral body so the
 * red damage / green heal controls stay legible) showing their current life. Each tile offers,
 * fastest to most precise: ±1/±5 quick buttons, custom Damage/Heal (the shared
 * {@link NumberDialogComponent}, sign fixed by the action so the keypad's toggle isn't relied on),
 * and tap-the-number to set life directly. A tucked-away history button opens
 * {@link HealthPointsHistoryDialogComponent} to edit/remove any past change. Players at 0 are
 * flagged OUT; when one remains they're crowned the winner.
 */
@Component({
  selector: 'st-health-points-game',
  imports: [MatButtonModule, NgIcon, ColorDirective],
  templateUrl: './health-points-game.component.html',
  styleUrl: './health-points-game.component.scss',
})
export class HealthPointsGameComponent {
  readonly gameService = inject(HealthPointsService);
  private readonly dialog = inject(MatDialog);
  private readonly confirm = inject(ConfirmService);
  private readonly numberDialog = inject(NumberDialogService);

  /** Quick-step magnitudes, ordered for the damage (−) and heal (+) button groups. */
  readonly damageSteps = [5, 1];
  readonly healSteps = [1, 5];

  isWinner(player: Player): boolean {
    return this.gameService.winner()?.playerNumber === player.playerNumber;
  }

  /** Apply a fixed quick step (positive heals, negative damages). */
  adjust(player: Player, delta: number): void {
    this.gameService.adjust(player, delta);
  }

  /** Prompt for an amount and subtract it — the sign comes from the action, not the keypad. */
  customDamage(player: Player): void {
    this.numberDialog
      .prompt({ player, action: 'Damage' })
      .subscribe((amount) => this.gameService.adjust(player, -Math.abs(amount)));
  }

  /** Prompt for an amount and add it. */
  customHeal(player: Player): void {
    this.numberDialog
      .prompt({ player, action: 'Heal' })
      .subscribe((amount) => this.gameService.adjust(player, Math.abs(amount)));
  }

  /** Tap the life number to set an exact value; stored as the single delta that reaches it. */
  setLife(player: Player, current: number): void {
    this.numberDialog
      .prompt({ player, action: 'Set Life', value: current })
      .subscribe((target) => this.gameService.adjust(player, target - current));
  }

  /** Open this player's change history to review, correct, or remove past changes. */
  openHistory(player: Player): void {
    const data: HealthPointsHistoryData = { player };
    this.dialog.open(HealthPointsHistoryDialogComponent, { data, width: '22rem', maxWidth: '95vw' });
  }

  newGame(): void {
    this.confirm.newGame(() => this.gameService.reset());
  }
}
