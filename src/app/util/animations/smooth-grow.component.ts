import { Component, ElementRef, HostBinding, Input, OnChanges, inject } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'st-smooth-grow',
  template: `<ng-content></ng-content>`,
  styles: [
    `
      :host {
        display: block;
        overflow: hidden;
      }
    `,
  ],
  animations: [
    trigger('grow', [
      transition('void <=> *', []),
      transition(
        '* <=> *',
        [style({ height: '{{startHeight}}px', width: '{{startWidth}}px' }), animate('400ms ease')],
        { params: { startHeight: 0, startWidth: 0 } },
      ),
    ]),
  ],
})
export class SmoothGrowComponent implements OnChanges {
  @Input() trigger: unknown;

  startHeight = 0;
  startWidth = 0;

  private element = inject<ElementRef<HTMLElement>>(ElementRef);

  @HostBinding('@grow') get grow() {
    return {
      value: this.trigger,
      params: { startHeight: this.startHeight, startWidth: this.startWidth },
    };
  }

  setStartSize(): void {
    this.startHeight = this.element.nativeElement.clientHeight;
    this.startWidth = this.element.nativeElement.clientWidth;
  }

  ngOnChanges(): void {
    this.setStartSize();
  }
}
