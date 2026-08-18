import { Component, inject } from '@angular/core';
import { SkinService } from '@core/skin/skin.service';
import { SKINS, Skin } from '@core/skin/skin';
import { FormFieldComponent } from '@ui/form-field/form-field.component';
import { SelectComponent, SelectOption } from '@ui/select/select.component';

/** A selector for the application skin. */
@Component({
  selector: 'st-skin-select-dropdown',
  imports: [FormFieldComponent, SelectComponent],
  templateUrl: './skin-select-dropdown.html',
  styleUrl: './skin-select-dropdown.scss',
})
export class SkinSelectDropdown {
  protected readonly skinService = inject(SkinService);

  protected readonly skinOptions: SelectOption<Skin>[] = SKINS.map((skin) => ({
    value: skin,
    label: skin[0].toUpperCase() + skin.slice(1),
  }));

  /** `st-select`'s `valueChange` is typed `T | null` (it also backs the no-selection
   *  placeholder state); a skin is always pre-selected here, so `null` never actually
   *  fires — this guard exists only to satisfy that type. */
  protected onSkinChange(skin: Skin | null): void {
    if (skin) {
      this.skinService.select(skin);
    }
  }
}
