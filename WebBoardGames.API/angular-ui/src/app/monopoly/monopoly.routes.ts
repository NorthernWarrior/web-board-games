import { Routes } from '@angular/router';
import { MonopolyComponent } from './monopoly.component';
import { MonopolyBankerGameComponent } from './banker/game/game.component';
import { MonopolyBankerMenuComponent } from './banker/menu/menu.component';
import { MonopolyClassicGameComponent } from './classic/game/game.component';

export const routes: Routes = [
  { path: '', component: MonopolyComponent, pathMatch: 'full' },
  { path: 'banker', component: MonopolyBankerMenuComponent },
  { path: 'banker/:game_id', component: MonopolyBankerGameComponent },
  { path: 'classic', component: MonopolyClassicGameComponent },
];
