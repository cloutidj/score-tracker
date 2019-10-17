import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PlayerInfoComponent } from './player-info/player-info.component';
import { CommonModule } from '@angular/common';
import { PlayerSelectionComponent } from './player-selection/player-selection.component';
import { PlayerScoreComponent } from './player-score/player-score.component';
import { ClarityModule } from '@clr/angular';
import { UtilModule } from '@util/util.module';

@NgModule({
  declarations: [
    PlayerInfoComponent,
    PlayerSelectionComponent,
    PlayerScoreComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ClarityModule,
    UtilModule
  ],
  exports: [
    PlayerSelectionComponent,
    PlayerScoreComponent
  ]
})
export class SharedFormsModule {}
