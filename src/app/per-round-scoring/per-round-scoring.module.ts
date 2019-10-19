import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { SharedFormsModule } from '@forms/shared-forms.module';
import { PerRoundScoringGameComponent } from './per-round-scoring-game/per-round-scoring-game.component';
import { PerRoundScoreTableComponent } from './per-round-score-table/per-round-score-table.component';
import { PerRoundScoringComponent } from './per-round-scoring.component';
import { ClarityModule } from '@clr/angular';

@NgModule({
  declarations: [
    PerRoundScoringComponent,
    PerRoundScoringGameComponent,
    PerRoundScoreTableComponent
  ],
  imports: [
    BrowserModule,
    SharedFormsModule,
    ClarityModule
  ],
  providers: [],
  exports: [
    PerRoundScoringComponent
  ]
})
export class PerRoundScoringModule {}
