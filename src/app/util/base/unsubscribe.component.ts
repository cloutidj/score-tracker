import { Subject } from 'rxjs';
import { OnDestroy } from '@angular/core';

export abstract class UnsubscribeComponent implements OnDestroy {
  protected unsubscribe = new Subject();

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
