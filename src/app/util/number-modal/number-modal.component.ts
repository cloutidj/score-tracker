import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClarityModule, ClrModal } from '@clr/angular';
import { BaseModal } from '@util/base/base-modal';

export interface NumberModalData {
  title: string;
}

@Component({
  selector: 'st-number-modal',
  imports: [ClarityModule, FormsModule],
  templateUrl: './number-modal.component.html',
})
export class NumberModalComponent extends BaseModal<number> implements OnInit, AfterViewInit {
  @ViewChild(ClrModal, { static: true }) clrModal!: ClrModal;
  @ViewChild('numberInput', { static: true }) input!: ElementRef<HTMLInputElement>;

  data!: NumberModalData;
  readonly numberValue = signal<number | null>(null);

  ngOnInit(): void {
    this.clrModal.open();
  }

  ngAfterViewInit(): void {
    this.input.nativeElement.focus();
  }

  cancel(): void {
    this._reject();
    this.clrModal.close();
  }

  submit(): void {
    this._resolve(this.numberValue() ?? 0);
    this.clrModal.close();
  }
}
