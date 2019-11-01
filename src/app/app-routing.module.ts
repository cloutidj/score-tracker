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
    path: 'perRoundScoring',
    component: PerRoundScoringComponent,
    data: {
      animationLevel: 2
    }
  }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
