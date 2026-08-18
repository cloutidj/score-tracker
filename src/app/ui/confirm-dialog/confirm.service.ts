import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { DialogService } from '@ui/dialog/dialog.service';
import { ConfirmDialogComponent, ConfirmDialogData } from './confirm-dialog.component';

/** Wraps {@link ConfirmDialogComponent} so callers don't re-spell the `open(...).afterClosed()` boilerplate. */
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
}
