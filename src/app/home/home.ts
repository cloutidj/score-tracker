import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { NgIcon } from '@ng-icons/core';
import { GameTypeRegistry } from '@game/game-type-registry';

@Component({
  selector: 'st-home',
  imports: [RouterLink, MatCardModule, NgIcon],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  // One card per registered game type; each links to its `/play/:gameType` route.
  protected readonly gameTypes = inject(GameTypeRegistry).all();
}
