import { Component, inject, input, signal } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Player } from '@player/models/player';
import { PlayerPreference } from '@player/models/player-preference';
import { SavedPlayerService } from '@player/saved-player.service';
import { ColorPickerComponent } from '@player/colors/color-picker/color-picker.component';

/** Identity entry mode: type a name, or import one from a saved player. */
type IdentityMode = 'manual' | 'import';

/**
 * Editor for one player's name + color. It does not own a form: the parent passes the
 * player's `FieldTree` and this component binds the name input and color picker to its
 * `name`/`color` sub-fields via `[formField]`. Validation (required, uniqueness) lives in
 * the parent schema, so touched/invalid state is read straight off the field signals.
 */
@Component({
  selector: 'st-player-info',
  imports: [
    FormField,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FontAwesomeModule,
    ColorPickerComponent,
  ],
  templateUrl: './player-info.component.html',
  styleUrl: './player-info.component.scss',
})
export class PlayerInfoComponent {
  /** The player's field, owned by the parent form. */
  readonly field = input.required<FieldTree<Player>>();
  /** When true, expose the manual/import toggle (game setup); off for saved-player editing. */
  readonly allowImport = input(false);

  protected readonly savedPlayerService = inject(SavedPlayerService);

  protected readonly mode = signal<IdentityMode>('manual');

  /** Toggle between typing a name and picking a saved player. */
  toggleMode(): void {
    this.mode.set(this.mode() === 'manual' ? 'import' : 'manual');
  }

  /**
   * Fill the field from a saved player and drop back to manual mode so the name is
   * visible/editable and the color stays adjustable (e.g. to resolve a conflict).
   */
  importPlayer(saved: PlayerPreference): void {
    if (!saved) {
      return;
    }
    this.field()().value.update((player) => ({ ...player, name: saved.name, color: saved.color }));
    this.mode.set('manual');
  }
}
