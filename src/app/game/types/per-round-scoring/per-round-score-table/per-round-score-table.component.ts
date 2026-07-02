import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { NgIcon } from '@ng-icons/core';
import { Player } from '@player/models/player';
import { NumberDialogService } from '@ui/number-dialog/number-dialog.service';
import { ColorDirective } from '@color/color.directive';
import { PerRoundScoringService } from '../per-round-scoring.service';
import { GameRound } from '../models/game-round';

const ROUND_CUTOFF = 10;

@Component({
  selector: 'st-per-round-score-table',
  imports: [MatButtonModule, NgIcon, ColorDirective],
  templateUrl: './per-round-score-table.component.html',
  styleUrl: './per-round-score-table.component.scss',
})
export class PerRoundScoreTableComponent {
  readonly gameService = inject(PerRoundScoringService);
  private readonly numberDialog = inject(NumberDialogService);

  readonly showAllRounds = signal(false);

  trimmedTable(): boolean {
    return this.gameService.gameRounds().length > ROUND_CUTOFF;
  }

  showRound(roundIndex: number): boolean {
    return this.showAllRounds() || roundIndex >= this.gameService.gameRounds().length - ROUND_CUTOFF;
  }

  editScore(player: Player, round: GameRound): void {
    this.numberDialog
      .prompt({ player, action: round.label })
      .subscribe((val) => this.gameService.modifyScore(player, round.roundId, val));
  }
}
