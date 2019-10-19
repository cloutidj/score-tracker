import { Component } from '@angular/core';

@Component({
  selector: 'st-root',
  template: `
      <clr-main-container>
          <div class="content-container">
              <main class="content-area">
                  <st-modal-container></st-modal-container>
                  <router-outlet></router-outlet>
              </main>
          </div>
      </clr-main-container>`,
  styles: [`
      .main-container .content-container .content-area {
        padding-top: 0;
    }`]
})
export class AppComponent {}
