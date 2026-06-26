import { Component, effect, inject, input, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ClarityModule } from '@clr/angular';
import { PlayerBase } from '@models/player-base';
import { PlayerPreference } from '@models/player-preference';
import { PlayerInfoComponent } from '@forms/player-info/player-info.component';

@Component({
  selector: 'st-player-preferences-form',
  imports: [ReactiveFormsModule, ClarityModule, PlayerInfoComponent],
  templateUrl: './player-preferences-form.component.html',
})
export class PlayerPreferencesFormComponent {
  readonly playerData = input<PlayerPreference | null>(null);

  readonly save = output<PlayerBase>();
  readonly cancelEdit = output<void>();

  private readonly fb = inject(NonNullableFormBuilder);
  readonly playerForm = this.fb.group({
    player: this.fb.control<PlayerBase | null>(null),
  });

  constructor() {
    // Re-seed the wrapped player-info CVA whenever the parent swaps the player being edited.
    effect(() => {
      this.playerForm.controls.player.setValue(this.playerData(), { emitEvent: false });
    });
  }

  saveClick(): void {
    const player = this.playerForm.value.player;
    if (this.playerForm.valid && player) {
      this.save.emit(player);
    }
  }
}
