import { UtilModule } from '@util/util.module';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedFormsModule } from './../forms/shared-forms.module';
import { CommonModule } from '@angular/common';
import { SavedPlayersComponent } from './saved-players/saved-players.component';
import { PlayerPreferencesFormComponent } from './player-preferences-form/player-preferences-form.component';
import { NgModule } from '@angular/core';
import { ClarityModule } from '@clr/angular';

@NgModule({
  declarations: [
    SavedPlayersComponent,
    PlayerPreferencesFormComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ClarityModule,
    SharedFormsModule,
    UtilModule
  ],
  exports: [
    SavedPlayersComponent
  ]
})
export class PlayerModule { }
