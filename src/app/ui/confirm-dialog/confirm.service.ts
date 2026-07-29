import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { DialogService } from '@ui/dialog/dialog.service';
import { ConfirmDialogComponent, ConfirmDialogData } from './confirm-dialog.component';

/**
 * Wraps {@link ConfirmDialogComponent} so callers don't re-spell the
 * `open(...).afterClosed()` boilerplate. {@link ask} coerces the result to a
 * plain boolean; {@link newGame} carries the shared "discard and start over"
 * prompt used by every game view.
 */
@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private readonly dialog = inject(DialogService);

  /** Open a confirm/cancel dialog, emitting `true` only when confirmed. */
  ask(data: ConfirmDialogData): Observable<boolean> {
    return this.dialog
      .open<ConfirmDialogComponent, ConfirmDialogData, boolean>(ConfirmDialogComponent, { data })
      .afterClosed()
      .pipe(map((confirmed) => confirmed === true));
  }

  /** Confirm discarding the current game, running `onConfirm` if accepted. */
  newGame(onConfirm: () => void): void {
    this.ask({
      title: 'New Game',
      message: 'Discard the current game and start over?',
      confirmLabel: 'New Game',
    }).subscribe((confirmed) => {
      if (confirmed) {
        onConfirm();
      }
    });
  }
}
