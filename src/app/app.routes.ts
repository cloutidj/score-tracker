import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home').then((m) => m.Home),
  },
  {
    path: 'SavedPlayers',
    loadComponent: () =>
      import('./player/saved-players/saved-players.component').then(
        (m) => m.SavedPlayersComponent,
      ),
  },
  {
    // Throwaway Phase 2 smoke-test page; removed in a later phase.
    path: 'harness',
    loadComponent: () => import('./harness/harness').then((m) => m.Harness),
  },
  { path: '**', redirectTo: '' },
];
