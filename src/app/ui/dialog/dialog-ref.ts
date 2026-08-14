import { OverlayRef } from '@angular/cdk/overlay';
import { Observable, Subject } from 'rxjs';

/** Class `close()` adds to trigger the leave animation — see `_motion.scss`. */
const LEAVE_ANIMATION_CLASS = 'st-dialog-leave';

/**
 * Safety net if the leave animation's `animationend` never fires (element removed some other
 * way, reduced-motion edge case, etc.) — mirrors the fallback CDK's own `BackdropRef.detach()`
 * uses for the same reason.
 */
const LEAVE_ANIMATION_FALLBACK_MS = 500;

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

  /**
   * Closes the dialog. Plays the pane's leave animation and lets the backdrop run its own
   * built-in fade (`OverlayRef.detachBackdrop()`, not a manual class — CDK already ships a
   * proper enter/leave transition for it) before disposing the overlay and restoring focus.
   */
  close(result?: R): void {
    if (this.isClosed) {
      return;
    }
    this.isClosed = true;

    this.overlayRef.detachBackdrop();

    const paneEl = this.overlayRef.overlayElement;
    // Not `{ once: true }`: `animationend` bubbles from any animated descendant, and a false
    // match there would deregister this listener before the pane's own leave animation ends.
    const finish = (event?: AnimationEvent): void => {
      if (event && event.target !== paneEl) {
        return;
      }
      clearTimeout(fallback);
      paneEl.removeEventListener('animationend', finish as EventListener);
      this.overlayRef.dispose();
      this.restoreFocus();
      this.closedSubject.next(result);
      this.closedSubject.complete();
    };
    const fallback = setTimeout(finish, LEAVE_ANIMATION_FALLBACK_MS);
    paneEl.addEventListener('animationend', finish as EventListener);
    paneEl.classList.add(LEAVE_ANIMATION_CLASS);
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
