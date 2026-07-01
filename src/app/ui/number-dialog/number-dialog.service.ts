import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { filter, Observable } from 'rxjs';
import { NumberDialogComponent, NumberDialogData } from './number-dialog.component';

/**
 * Wraps {@link NumberDialogComponent} so callers don't re-spell the
 * `open(...).afterClosed()` boilerplate. {@link prompt} emits only when the
 * user confirms a value — cancelling (which closes with no value) emits nothing.
 */
@Injectable({ providedIn: 'root' })
export class NumberDialogService {
  private readonly dialog = inject(MatDialog);

  /** Open the number pad, emitting the entered value once and skipping cancels. */
  prompt(data: NumberDialogData): Observable<number> {
    return this.dialog
      .open(NumberDialogComponent, { data })
      .afterClosed()
      .pipe(filter((value): value is number => value != null));
  }
}
