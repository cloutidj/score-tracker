import { Component, output } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { ButtonComponent } from '@ui/button/button.component';
import { IconButtonComponent } from '@ui/icon-button/icon-button.component';

/**
 * A dismissible toast, not a fixture. Doesn't auto-dismiss on a timer — a
 * reload prompt is fine to sit until the player acts on it or dismisses it
 * explicitly.
 */
@Component({
  selector: 'st-update-toast',
  imports: [NgIcon, ButtonComponent, IconButtonComponent],
  templateUrl: './update-toast.component.html',
  styleUrl: './update-toast.component.scss',
})
export class UpdateToastComponent {
  readonly updateApplication = output<void>();
  readonly dismiss = output<void>();
}
