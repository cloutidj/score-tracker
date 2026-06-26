import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { SharedFormsModule } from '@forms/shared-forms.module';
import { PerRoundScoringGameComponent } from './per-round-scoring-game/per-round-scoring-game.component';
import { PerRoundScoreTableComponent } from './per-round-score-table/per-round-score-table.component';
import { PerRoundScoringComponent } from './per-round-scoring.component';
import { ClarityModule } from '@clr/angular';
import { FormsModule } from '@angular/forms';
import { PerRoundScoreLineChartComponent } from './per-round-score-line-chart/per-round-score-line-chart.component';
import { ChartsModule } from 'ng2-charts';
import { PerRoundScoreBarChartComponent } from './per-round-score-bar-chart/per-round-score-bar-chart.component';

@NgModule({
  declarations: [
    PerRoundScoringComponent,
    PerRoundScoringGameComponent,
    PerRoundScoreTableComponent,
    PerRoundScoreLineChartComponent,
    PerRoundScoreBarChartComponent
  ],
  imports: [
    BrowserModule,
    SharedFormsModule,
    ClarityModule,
    FormsModule,
    ChartsModule
  ],
  providers: [],
  exports: [
    PerRoundScoringComponent
  ]
})
export class PerRoundScoringModule {}
