import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { GameTypeRegistry } from '@game/game-type-registry';

@Component({
  selector: 'st-home',
  imports: [RouterLink, MatCardModule, FontAwesomeModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  // One card per registered game type; each links to its `/play/:gameType` route.
  protected readonly gameTypes = inject(GameTypeRegistry).all();
}
