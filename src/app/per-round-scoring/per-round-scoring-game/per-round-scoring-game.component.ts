import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PlayerScoreComponent } from '@forms/player-score/player-score.component';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '@util/confirm-dialog/confirm-dialog.component';
import { PerRoundScoringService } from '../per-round-scoring.service';
import { PerRoundScoreTableComponent } from '../per-round-score-table/per-round-score-table.component';
import { PerRoundScoreLineChartComponent } from '../per-round-score-line-chart/per-round-score-line-chart.component';
import { PerRoundScoreBarChartComponent } from '../per-round-score-bar-chart/per-round-score-bar-chart.component';

@Component({
  selector: 'st-per-round-scoring-game',
  imports: [
    MatButtonModule,
    MatTabsModule,
    FontAwesomeModule,
    PlayerScoreComponent,
    PerRoundScoreTableComponent,
    PerRoundScoreLineChartComponent,
    PerRoundScoreBarChartComponent,
  ],
  templateUrl: './per-round-scoring-game.component.html',
  styleUrl: './per-round-scoring-game.component.scss',
})
export class PerRoundScoringGameComponent {
  readonly gameService = inject(PerRoundScoringService);
  private readonly dialog = inject(MatDialog);

  newGame(): void {
    const data: ConfirmDialogData = {
      title: 'New Game',
      message: 'Discard the current game and start over?',
      confirmLabel: 'New Game',
    };
    this.dialog
      .open(ConfirmDialogComponent, { data })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) {
          this.gameService.reset();
        }
      });
  }
}
