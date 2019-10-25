import { Component } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { UnsubscribeComponent } from '@util/base/unsubscribe.component';
import { takeUntil } from 'rxjs/operators';
import { DocumentWrapperService } from './document-wrapper.service';

@Component({
  selector: 'st-root',
  templateUrl: './app.component.html'
})
export class AppComponent extends UnsubscribeComponent {
  public updateAvailable = false;

  constructor(private updates: SwUpdate, private documentService: DocumentWrapperService) {
    super();
    updates.available.pipe(takeUntil(this.unsubscribe)).subscribe(() => {
      this.updateAvailable = true;
    });
  }

  updateApplication(): void {
    this.updates.activateUpdate().then(() => this.documentService.reloadPage());
  }
}
