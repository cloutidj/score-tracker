import { Component, computed, inject, input, signal } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { NgIcon } from '@ng-icons/core';
import { Player } from '@player/models/player';
import { SavedPlayerService } from '@player/saved-player.service';
import { IconButtonComponent } from '@ui/icon-button/icon-button.component';
import { FormFieldComponent } from '@ui/form-field/form-field.component';
import { SelectComponent, SelectOption } from '@ui/select/select.component';
import { ColorPickerComponent } from '@color/color-picker/color-picker.component';

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
  imports: [FormField, NgIcon, IconButtonComponent, FormFieldComponent, SelectComponent, ColorPickerComponent],
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

  protected readonly savedPlayerOptions = computed<SelectOption<number>[]>(() =>
    this.savedPlayerService.savedPlayers().map((saved) => ({
      value: saved.playerPreferenceId,
      label: saved.name,
    })),
  );

  /** Toggle between typing a name and picking a saved player. */
  toggleMode(): void {
    this.mode.set(this.mode() === 'manual' ? 'import' : 'manual');
  }

  /**
   * Fill the field from the saved player picked in the import dropdown, then drop
   * back to manual mode so the name is visible/editable and the color stays
   * adjustable (e.g. to resolve a conflict).
   */
  protected importSavedPlayer(id: number | null): void {
    if (id === null) {
      return;
    }
    const saved = this.savedPlayerService.savedPlayers().find((p) => p.playerPreferenceId === id);
    if (!saved) {
      return;
    }
    this.field()().value.update((player) => ({ ...player, name: saved.name, color: saved.color }));
    this.mode.set('manual');
  }
}
