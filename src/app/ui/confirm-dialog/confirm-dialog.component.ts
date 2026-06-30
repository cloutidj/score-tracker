import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

/**
 * Generic confirm/cancel dialog returning a boolean via `MatDialogRef`.
 * Open with `MatDialog.open(ConfirmDialogComponent, { data })` and read the
 * result from `afterClosed()` (`true` = confirmed, `false`/`undefined` = not).
 */
@Component({
  selector: 'st-confirm-dialog',
  imports: [MatButtonModule, MatDialogModule],
  templateUrl: './confirm-dialog.component.html',
})
export class ConfirmDialogComponent {
  readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
}
