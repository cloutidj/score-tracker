import { Component, ElementRef, computed, contentChild, effect, input } from '@angular/core';

/** Per-instance error-span id counter, for `aria-describedby` wiring. */
let nextErrorId = 0;

/**
 * Label + native control + error text for every plain `<input>`/`<select>`/`<textarea>`
 * in the app. Call sites project the control directly:
 *
 * ```html
 * <st-form-field label="Player Name" [invalid]="f.name().invalid()" [touched]="f.name().touched()">
 *   <input type="text" #control [formField]="f.name" />
 * </st-form-field>
 * ```
 *
 * `invalid`/`touched`/`errorText` are plain inputs the call site derives from its own
 * field state — this component doesn't hold the value, the projected control does.
 *
 * The `#control` template reference variable is how the wrapper reaches the projected
 * native element to point `aria-describedby` at the error text once it's shown —
 * content projection gives no other way in. It's optional: a control that omits it
 * still renders and behaves, it just skips that one attribute.
 */
@Component({
  selector: 'st-form-field',
  templateUrl: './form-field.component.html',
  styleUrl: './form-field.component.scss',
})
export class FormFieldComponent {
  readonly label = input.required<string>();
  readonly invalid = input(false);
  readonly touched = input(false);
  readonly errorText = input<string | null>(null);

  protected readonly showError = computed(() => this.invalid() && this.touched());
  protected readonly errorId = `st-field-error-${nextErrorId++}`;

  private readonly control = contentChild<ElementRef<HTMLElement>>('control');

  constructor() {
    effect(() => {
      const el = this.control()?.nativeElement;
      if (!el) {
        return;
      }
      if (this.showError() && this.errorText()) {
        el.setAttribute('aria-describedby', this.errorId);
      } else {
        el.removeAttribute('aria-describedby');
      }
    });
  }
}
