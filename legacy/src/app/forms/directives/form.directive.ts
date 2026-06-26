import { Directive } from '@angular/core';
import { ClrForm } from '@clr/angular';
import { Observable, Subject } from 'rxjs';

/** Provide a wrapper service to the clarity ClrForm service
 * to allow custom controls to listen to the markAsTouched() event
 */
@Directive({
  // tslint:disable-next-line:directive-selector
  selector: 'form[clrForm]'
})
export class FormDirective {
  private _touchedEvent = new Subject<void>();

  constructor(public clrForm: ClrForm) {}

  public touchEvent(): Observable<void> {
    return this._touchedEvent.asObservable();
  }

  public markAsTouched() {
    this._touchedEvent.next();
    this.clrForm.markAsTouched();
  }
}
