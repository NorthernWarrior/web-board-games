import { inject, Injectable } from '@angular/core';
import { ApiService } from 'app/api/api-service';
import { StorageService } from 'app/services/storage.service';
import { map, Observable, of } from 'rxjs';

export interface RecentGame {
  gameID: string;
  gameLabel: string;
  playerID: string;
  playerName: string;
}

@Injectable({
  providedIn: 'root',
})
export class RecentGamesService {

  private readonly _storageKey = 'monopoly-banker-recent-games';
  private readonly _storage = inject(StorageService);
  private readonly _api = inject(ApiService);

  private _recentGames: RecentGame[]|null = null;

  addRecentGame(game: RecentGame) {
    this.getRecentGames$().subscribe((games) => {
        if (games.findIndex(g => g.gameID === game.gameID && g.playerID === game.playerID) !== -1){
            return;
        }
        games.push(game);
        this._storage.setObject<RecentGame[]>(this._storageKey, games);
    });
  }

  getRecentGames$(): Observable<RecentGame[]> {
    // Load recent games from storage
    // But also check if the game ids are still valid via an API call
    var fromStorage = this._storage.getObject<RecentGame[]>(this._storageKey, []);
    if (!fromStorage || fromStorage.length === 0){
        this._recentGames = [];
        return of(this._recentGames);
    }
    if (fromStorage?.length === 0){
        this._recentGames = [];
        return of(this._recentGames);
    }
    return this._api.gamesStillActive(fromStorage.map(g => g.gameID)).pipe(
        // Map to only the still active games
        // and store back to storage
        // and return the filtered list
        map((activeMap) => {
            const filtered = fromStorage!.filter(g => activeMap[g.gameID]);
            this._storage.setObject<RecentGame[]>(this._storageKey, filtered);
            this._recentGames = filtered;
            return filtered;
        })
    );
  }
}
