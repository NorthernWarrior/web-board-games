import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface GameJoinRequest {
  gameID: string;
  playerName: string;
}

export interface GameCreateRequest {
  label: string;
  playerName: string;
  moneyOnFreeParking: boolean;
  doubleMoneyOnGo: boolean;
}

export interface PlayerInfo {
  id: string;
  name: string;
  balance: number;
}

export interface GameDataResponse {
  players: PlayerInfo[];
  player: PlayerInfo;
  options: {
    moneyOnFreeParking: boolean;
    doubleMoneyOnGo: boolean;
  };
  freeParking: PlayerInfo | null;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private _cachedGame: GameDataResponse | null = null;

  gameExists(request: GameJoinRequest): Observable<{ exists: boolean; playerID: string | null }> {
    // Placeholder implementation
    return of(
      request.gameID === '1234'
        ? { exists: true, playerID: '5678' }
        : { exists: false, playerID: null }
    );
  }

  gameCreate(request: GameCreateRequest): Observable<{ gameID: string; playerID: string }> {
    // Placeholder implementation
    this._cachedGame = {
      players: [
        { id: '1', name: 'Alice', balance: 1500 },
        { id: '2', name: 'Bob', balance: 1500 },
        { id: '5678', name: 'Test', balance: 1500 },
        { id: 'free-parking', name: 'Free Parking', balance: 0 },
      ].filter(p => p.id !== 'free-parking' || request.moneyOnFreeParking),
      player: { id: '5678', name: 'Test', balance: 1500 },
      options: { moneyOnFreeParking: request.moneyOnFreeParking, doubleMoneyOnGo: request.doubleMoneyOnGo },
      freeParking: request.moneyOnFreeParking ? { id: 'free-parking', name: 'Free Parking', balance: 0 } : null,
    };
    return of({ gameID: '1234', playerID: '5678' });
  }

  getGameData(gameID: string): Observable<GameDataResponse | null> {
    // Placeholder implementation
    if (gameID !== '1234') {
      return of(null);
    }
    if (!this._cachedGame) {
      this._cachedGame = {
        players: [
          { id: '1', name: 'Alice', balance: 1500 },
          { id: '2', name: 'Bob', balance: 1500 },
          { id: '5678', name: 'Test', balance: 1500 },
          { id: 'free-parking', name: 'Free Parking', balance: 0 },
        ],
        player: { id: '5678', name: 'Test', balance: 1500 },
        options: { moneyOnFreeParking: true, doubleMoneyOnGo: true },
        freeParking: { id: 'free-parking', name: 'Free Parking', balance: 0 },
      };
    }
    return of(this._cachedGame);
  }

  executePayment(
    gameID: string,
    playerID: string,
    sourcePlayerID: string | null,
    targetPlayerID: string | null,
    amount: number
  ): Observable<GameDataResponse | null> {
    if (gameID !== '1234' || !this._cachedGame) {
      return of(null);
    }
    const source = sourcePlayerID
      ? this._cachedGame.players.find((p) => p.id === sourcePlayerID)
      : null;
    const target = targetPlayerID
      ? this._cachedGame.players.find((p) => p.id === targetPlayerID)
      : null;

    if (source) {
      source.balance -= amount;
    }
    if (target) {
      target.balance += amount;
    }

    this._cachedGame.player = this._cachedGame.players.find((p) => p.id === playerID)!;
    this._cachedGame.freeParking = this._cachedGame.players.find((p) => p.id === 'free-parking')!;
    return of(this._cachedGame);
  }
}
