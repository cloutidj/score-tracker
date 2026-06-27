import { Component, inject } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PlayerScoreComponent } from '@forms/player-score/player-score.component';
import { PerRoundScoringService } from '../per-round-scoring.service';
import { PerRoundScoreTableComponent } from '../per-round-score-table/per-round-score-table.component';
import { PerRoundScoreLineChartComponent } from '../per-round-score-line-chart/per-round-score-line-chart.component';
import { PerRoundScoreBarChartComponent } from '../per-round-score-bar-chart/per-round-score-bar-chart.component';

@Component({
  selector: 'st-per-round-scoring-game',
  imports: [
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
}
