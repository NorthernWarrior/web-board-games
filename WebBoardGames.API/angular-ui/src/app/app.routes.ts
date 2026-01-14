import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'monopoly', pathMatch: 'full' },
  {
    path: 'monopoly',
    loadChildren: () => import('./monopoly/monopoly.routes').then((m) => m.routes),
  },
];
