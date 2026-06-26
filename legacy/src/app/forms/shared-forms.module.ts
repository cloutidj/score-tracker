import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PlayerInfoComponent } from './player-info/player-info.component';
import { CommonModule } from '@angular/common';
import { PlayerSelectionComponent } from './player-selection/player-selection.component';
import { PlayerScoreComponent } from './player-score/player-score.component';
import { ClarityModule } from '@clr/angular';
import { UtilModule } from '@util/util.module';
import { FormDirective } from '@forms/directives/form.directive';
import { SavedPlayerSelectComponent } from './saved-player-select/saved-player-select.component';

@NgModule({
  declarations: [
    PlayerInfoComponent,
    PlayerSelectionComponent,
    PlayerScoreComponent,
    SavedPlayerSelectComponent,
    FormDirective
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ClarityModule,
    UtilModule
  ],
  exports: [
    PlayerInfoComponent,
    PlayerSelectionComponent,
    PlayerScoreComponent,
    FormDirective
  ]
})
export class SharedFormsModule { }
