import { Directive, inject } from '@angular/core';
import { ClrForm } from '@clr/angular';
import { Observable, Subject } from 'rxjs';

/**
 * Wraps Clarity's {@link ClrForm} so custom controls (e.g. the color picker) can react
 * to a form-wide `markAsTouched()` and reveal their own validation errors on submit.
 */
@Directive({
  // Intentionally targets Clarity's form, not an st-prefixed selector.
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'form[clrForm]',
})
export class FormDirective {
  private readonly clrForm = inject(ClrForm);
  private readonly touched = new Subject<void>();

  /** Emits whenever the form is force-marked as touched (e.g. on submit). */
  touchEvent(): Observable<void> {
    return this.touched.asObservable();
  }

  markAsTouched(): void {
    this.touched.next();
    this.clrForm.markAsTouched();
  }
}
