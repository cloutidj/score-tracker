import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BaseModal } from '@util/base/base-modal';
import { ClrModal } from '@clr/angular';

export interface NumberModalData {
  title: string;
}

@Component({
  selector: 'st-number-modal',
  templateUrl: './number-modal.component.html'
})
export class NumberModalComponent extends BaseModal<number> implements OnInit, AfterViewInit {
  @ViewChild(ClrModal, { static: true }) clrModal: ClrModal;
  @ViewChild('numberInput', { static: true }) input: ElementRef;

  public data: NumberModalData;
  public numberValue: number;

  ngOnInit(): void {
    this.clrModal.open();
  }

  ngAfterViewInit(): void {
    this.input.nativeElement.focus();
  }

  cancel() {
    this._reject();
    this.clrModal.close();
  }

  submit() {
    this._resolve(this.numberValue);
    this.clrModal.close();
  }
}
