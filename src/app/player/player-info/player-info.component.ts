import { Component, input, signal } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { Player } from '@player/models/player';
import { PlayerBase } from '@player/models/player-base';
import { FormFieldComponent } from '@ui/form-field/form-field.component';
import { ColorPickerComponent } from '@color/color-picker/color-picker.component';
import { IdentityMode, SavedPlayerImportComponent } from './saved-player-import/saved-player-import.component';

/**
 * Editor for one player's name + color. It does not own a form: the parent passes the
 * player's `FieldTree` and this component binds the name input and color picker to its
 * `name`/`color` sub-fields via `[formField]`. Validation (required, uniqueness) lives in
 * the parent schema, so touched/invalid state is read straight off the field signals.
 */
@Component({
  selector: 'st-player-info',
  imports: [FormField, FormFieldComponent, ColorPickerComponent, SavedPlayerImportComponent],
  templateUrl: './player-info.component.html',
  styleUrl: './player-info.component.scss',
})
export class PlayerInfoComponent {
  /** The player's field, owned by the parent form. */
  readonly field = input.required<FieldTree<Player>>();
  /** When true, expose the manual/import toggle (game setup); off for saved-player editing. */
  readonly allowImport = input(false);

  protected readonly mode = signal<IdentityMode>('manual');

  protected toggleMode(): void {
    this.mode.set(this.mode() === 'manual' ? 'import' : 'manual');
  }

  /**
   * Fill the field from the saved player picked in the import dropdown, then drop
   * back to manual mode so the name is visible/editable and the color stays
   * adjustable (e.g. to resolve a conflict).
   */
  protected applyImport(saved: PlayerBase): void {
    this.field()().value.update((player) => ({ ...player, name: saved.name, color: saved.color }));
    this.mode.set('manual');
  }
}
