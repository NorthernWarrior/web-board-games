import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'misc', pathMatch: 'full' },
  {
    path: 'monopoly',
    loadChildren: () => import('./monopoly/monopoly.routes').then((m) => m.routes),
  },
  {
    path: 'misc',
    loadChildren: () => import('./misc/misc.routes').then((m) => m.routes),
  },
];
