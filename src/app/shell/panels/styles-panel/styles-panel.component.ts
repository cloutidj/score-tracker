import {Component, inject} from '@angular/core';
import {ThemeService} from '@core/theme.service';
import {ButtonComponent} from '@ui/button/button.component';
import { ToggleIconButtonComponent } from '@ui/toggle-icon-button/toggle-icon-button.component';
import {SkinSelectDropdown} from './skin-select-dropdown/skin-select-dropdown';
import {FormFieldComponent} from '@ui/form-field/form-field.component';

/**
 * The Styles panel's body: a light/dark switch, a skin picker, and a preview
 * section.
 */
@Component({
  selector: 'st-styles-panel',
  imports: [ButtonComponent, ToggleIconButtonComponent, SkinSelectDropdown, FormFieldComponent],
  templateUrl: './styles-panel.component.html',
  styleUrl: './styles-panel.component.scss',
})
export class StylesPanelComponent {
  protected readonly themeService = inject(ThemeService);
}
