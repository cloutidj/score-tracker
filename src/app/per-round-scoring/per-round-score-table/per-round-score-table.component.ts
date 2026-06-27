import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Player } from '@models/player';
import { NumberDialogComponent, NumberDialogData } from '@util/number-dialog/number-dialog.component';
import { PerRoundScoringService } from '../per-round-scoring.service';
import { GameRound } from '../models/game-round';

const ROUND_CUTOFF = 10;

@Component({
  selector: 'st-per-round-score-table',
  imports: [MatButtonModule, FontAwesomeModule],
  templateUrl: './per-round-score-table.component.html',
  styleUrl: './per-round-score-table.component.scss',
})
export class PerRoundScoreTableComponent {
  readonly gameService = inject(PerRoundScoringService);
  private readonly dialog = inject(MatDialog);

  readonly showAllRounds = signal(false);

  trimmedTable(): boolean {
    return this.gameService.gameRounds().length > ROUND_CUTOFF;
  }

  showRound(roundIndex: number): boolean {
    return this.showAllRounds() || roundIndex >= this.gameService.gameRounds().length - ROUND_CUTOFF;
  }

  editScore(player: Player, round: GameRound): void {
    const data: NumberDialogData = {
      title: `Edit Score for ${player.name} - ${round.label}`,
    };
    this.dialog
      .open(NumberDialogComponent, { data })
      .afterClosed()
      .subscribe((val) => {
        if (val != null) {
          this.gameService.modifyScore(player, round.roundId, val);
        }
      });
  }
}
