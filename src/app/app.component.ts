import { Component } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'st-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  public updateAvailable = false;

  constructor(private updates: SwUpdate) {
    updates.available.subscribe(() => {
      this.updateAvailable = true;
    });
  }

  updateApplication(): void {
    this.updates.activateUpdate().then(() => document.location.reload());
  }
}
