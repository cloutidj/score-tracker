import { Component, inject } from '@angular/core';
import { ButtonComponent } from '@ui/button/button.component';
import { DialogRef } from '@ui/dialog/dialog-ref';
import { DIALOG_DATA, DIALOG_REF } from '@ui/dialog/dialog.tokens';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

/**
 * Generic confirm/cancel dialog returning a boolean via `DialogRef`.
 * Open with `DialogService.open(ConfirmDialogComponent, { data })` and read the
 * result from `afterClosed()` (`true` = confirmed, `false`/`undefined` = not).
 */
@Component({
  selector: 'st-confirm-dialog',
  imports: [ButtonComponent],
  templateUrl: './confirm-dialog.component.html',
})
export class ConfirmDialogComponent {
  private readonly dialogRef = inject(DIALOG_REF) as DialogRef<boolean>;

  readonly data = inject(DIALOG_DATA) as ConfirmDialogData;

  close(confirmed: boolean): void {
    this.dialogRef.close(confirmed);
  }
}
