import { Component, inject, signal, viewChild } from '@angular/core';
import { transition, trigger } from '@angular/animations';
import { NgTemplateOutlet } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PlayerBase } from '@models/player-base';
import { PlayerPreference } from '@models/player-preference';
import { slideInLeft } from '@util/animations/in-out.animations';
import { PlayerColorDirective } from '@util/colors/player-color.directive';
import { ColorSwatchComponent } from '@util/colors/color-swatch/color-swatch.component';
import { PlayerInfoComponent } from '@forms/player-info/player-info.component';
import { SavedPlayerService } from '@player/saved-player.service';

@Component({
  selector: 'st-saved-players',
  imports: [
    NgTemplateOutlet,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    FontAwesomeModule,
    PlayerColorDirective,
    ColorSwatchComponent,
    PlayerInfoComponent,
  ],
  templateUrl: './saved-players.component.html',
  styleUrl: './saved-players.component.scss',
  animations: [trigger('formAnimation', [transition(':enter', slideInLeft)])],
})
export class SavedPlayersComponent {
  readonly savedPlayerService = inject(SavedPlayerService);

  // Which existing player's row is toggled into edit mode (by id), and whether the
  // "add" row is open at the top. Only one editor is ever active, so a single
  // reactive form drives whichever row is currently editing.
  readonly editingId = signal<number | null>(null);
  readonly adding = signal(false);

  private readonly playerInfo = viewChild.required(PlayerInfoComponent);

  private readonly fb = inject(NonNullableFormBuilder);
  readonly playerForm = this.fb.group({
    player: this.fb.control<PlayerBase | null>(null),
  });

  onAdd(): void {
    this.editingId.set(null);
    this.playerForm.setValue({ player: null });
    this.adding.set(true);
  }

  onEdit(player: PlayerPreference): void {
    this.adding.set(false);
    this.playerForm.setValue({ player });
    this.editingId.set(player.playerPreferenceId);
  }

  onDelete(player: PlayerPreference): void {
    this.savedPlayerService.removePlayer(player.playerPreferenceId);
    if (this.editingId() === player.playerPreferenceId) {
      this.cancel();
    }
  }

  save(): void {
    // The wrapped player-info holds its own reactive form, so reveal its
    // validation explicitly before checking validity.
    this.playerInfo().markAllAsTouched();
    const player = this.playerForm.getRawValue().player;
    if (!this.playerForm.valid || !player) {
      return;
    }

    if (this.adding()) {
      this.savedPlayerService.addPlayer(player);
    } else {
      const existing = this.savedPlayerService
        .savedPlayers()
        .find((p) => p.playerPreferenceId === this.editingId());
      if (existing) {
        this.savedPlayerService.editPlayer(Object.assign(existing, player));
      }
    }
    this.cancel();
  }

  cancel(): void {
    this.adding.set(false);
    this.editingId.set(null);
    this.playerForm.setValue({ player: null });
  }
}
