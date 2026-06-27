import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface NumberDialogData {
  title: string;
}

@Component({
  selector: 'st-number-dialog',
  imports: [FormsModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule],
  templateUrl: './number-dialog.component.html',
  styleUrl: './number-dialog.component.scss',
})
export class NumberDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<NumberDialogComponent, number>);

  readonly data = inject<NumberDialogData>(MAT_DIALOG_DATA);
  readonly numberValue = signal<number | null>(null);

  submit(): void {
    this.dialogRef.close(this.numberValue() ?? 0);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
