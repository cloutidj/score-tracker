import { SavedPlayersComponent } from './player/saved-players/saved-players.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { PerRoundScoringComponent } from './per-round-scoring/per-round-scoring.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    data: {
      animationLevel: 1
    }
  },
  {
    path: 'PerRoundScoring',
    component: PerRoundScoringComponent,
    data: {
      animationLevel: 2
    }
  },
  {
    path: 'SavedPlayers',
    component: SavedPlayersComponent,
    data: {
      animationLevel: 'up'
    }
  }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
