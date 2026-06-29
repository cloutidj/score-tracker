import { Component, inject, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { NgTemplateOutlet } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PlayerBase } from '@models/player-base';
import { PlayerColor } from '@models/player-color';
import { PlayerPreference } from '@models/player-preference';
import { PlayerColorDirective } from '@util/colors/player-color.directive';
import { PlayerInfoComponent } from '@forms/player-info/player-info.component';
import { SavedPlayerService } from '@player/saved-player.service';

@Component({
  selector: 'st-saved-players',
  imports: [
    NgTemplateOutlet,
    ReactiveFormsModule,
    MatButtonModule,
    FontAwesomeModule,
    PlayerColorDirective,
    PlayerInfoComponent,
  ],
  templateUrl: './saved-players.component.html',
  styleUrl: './saved-players.component.scss',
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

  // The color being edited, kept as a signal so the editor row re-themes live as
  // the color changes under zoneless change detection (mirrors the setup screen's
  // per-row theming). Null before a color is picked → the row stays neutral.
  readonly editColor = toSignal(
    this.playerForm.controls.player.valueChanges.pipe(
      map((player): PlayerColor | null => player?.color ?? null),
    ),
    { initialValue: null as PlayerColor | null },
  );

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
