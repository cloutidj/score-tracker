import { Component } from '@angular/core';

@Component({
  selector: 'st-home',
  template: `
      <div class="card-columns">
          <a class="card clickable" [routerLink]="['/perRoundScoring']">
              <div class="card-block">
                  <div class="card-title">
                      Scoring Per Round Game
                  </div>
                  <div class="card-text">
                      Each player scores per round - like Qwirkle
                  </div>
              </div>
          </a>
      </div>
  `
})
export class HomeComponent {}
