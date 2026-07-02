import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
    data: { animationLevel: 1 },
  },
  {
    // Single dynamic entry for every game type; the host resolves the descriptor from the
    // registry by id and runs setup → game. Unknown ids redirect Home (see PlayHostComponent).
    path: 'play/:gameType',
    loadComponent: () =>
      import('./pages/play/play-host.component').then((m) => m.PlayHostComponent),
    data: { animationLevel: 2 },
  },
  { path: '**', redirectTo: '' },
];
