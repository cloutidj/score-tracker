import { Component, computed, inject, input, output } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { PlayerBase } from '@player/models/player-base';
import { SavedPlayerService } from '@player/saved-player.service';
import { IconButtonComponent } from '@ui/button/icon-button.component';
import { FormFieldComponent } from '@ui/form-field/form-field.component';
import { SelectComponent, SelectOption } from '@ui/select/select.component';

/** Identity entry mode: type a name, or import one from a saved player. */
export type IdentityMode = 'manual' | 'import';

/**
 * The saved-player half of `PlayerInfoComponent`'s identity row: the manual/import toggle
 * button, and (in import mode) the saved-player dropdown. `display: contents` keeps the
 * button and dropdown direct flex items of the parent's `.identity-row`, as if they were
 * still written there.
 */
@Component({
  selector: 'st-saved-player-import',
  imports: [NgIcon, IconButtonComponent, FormFieldComponent, SelectComponent],
  templateUrl: './saved-player-import.component.html',
  styleUrl: './saved-player-import.component.scss',
})
export class SavedPlayerImportComponent {
  readonly mode = input.required<IdentityMode>();

  readonly toggled = output<void>();
  readonly picked = output<PlayerBase>();

  private readonly savedPlayerService = inject(SavedPlayerService);

  protected readonly savedPlayerOptions = computed<SelectOption<number>[]>(() =>
    this.savedPlayerService.savedPlayers().map((saved) => ({
      value: saved.playerPreferenceId,
      label: saved.name,
    })),
  );

  protected pick(id: number | null): void {
    if (id === null) {
      return;
    }
    const saved = this.savedPlayerService.savedPlayers().find((p) => p.playerPreferenceId === id);
    if (saved) {
      this.picked.emit(saved);
    }
  }
}
