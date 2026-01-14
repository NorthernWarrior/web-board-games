import { Routes } from '@angular/router';
import { MonopolyBankerGameComponent } from './banker/game/game.component';
import { MonopolyBankerLobbyComponent } from './banker/lobby/lobby.component';

export const routes: Routes = [
    { path: '', redirectTo: 'banker', pathMatch: 'full' },
    { path: "banker", component: MonopolyBankerLobbyComponent },
    { path: "banker/:game_id", component: MonopolyBankerGameComponent },
];
