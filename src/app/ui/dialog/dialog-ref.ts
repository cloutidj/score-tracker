import { OverlayRef } from '@angular/cdk/overlay';
import { Observable, Subject } from 'rxjs';

/**
 * Handle to an open dialog, returned by {@link DialogService.open} and injected via
 * `DIALOG_REF` by the dialog's own component.
 */
export class DialogRef<R = unknown> {
  private readonly closedSubject = new Subject<R | undefined>();
  private isClosed = false;

  constructor(
    private readonly overlayRef: OverlayRef,
    private readonly restoreFocus: () => void,
  ) {}

  /** Closes the dialog, disposing its overlay and restoring focus to the trigger. */
  close(result?: R): void {
    if (this.isClosed) {
      return;
    }
    this.isClosed = true;
    this.overlayRef.dispose();
    this.restoreFocus();
    this.closedSubject.next(result);
    this.closedSubject.complete();
  }

  /** Emits once, with the `close()` result, when the dialog closes. */
  afterClosed(): Observable<R | undefined> {
    return this.closedSubject.asObservable();
  }

  /** Adds a CSS class to the overlay pane — e.g. a size override for one dialog. */
  addPanelClass(className: string): void {
    this.overlayRef.addPanelClass(className);
  }
}
