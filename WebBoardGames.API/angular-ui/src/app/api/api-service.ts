import { EventEmitter, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export const specialPlayerID_Bank = null;
export const specialPlayerID_FreeParking = 'free-parking';
export type GameState = 'waiting-for-players' | 'in-progress' | 'completed';

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
  label: string;
  id: string;
  state: GameState;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private _cachedGame: GameDataResponse | null = null;
  public readonly gameChanged = new EventEmitter<GameDataResponse>();

  gameJoin(
    request: GameJoinRequest,
  ): Observable<{ exists: boolean; alreadyInProgrss: boolean; playerID: string | null }> {
    // Placeholder implementation
    if (request.gameID !== '1234') {
      return of({ exists: false, alreadyInProgrss: false, playerID: null });
    }
    if (!this._cachedGame) {
      this._cachedGame = {
        id: request.gameID,
        players: [
          { id: '1', name: 'Alice', balance: 1500 },
          { id: '2', name: 'Bob', balance: 1500 },
          { id: '5678', name: request.playerName, balance: 1500 },
          { id: '63', name: 'Peter', balance: -22 },
          { id: specialPlayerID_FreeParking, name: 'Free Parking', balance: 0 },
        ],
        player: { id: '5678', name: request.playerName, balance: 1500 },
        options: { moneyOnFreeParking: true, doubleMoneyOnGo: true },
        freeParking: { id: specialPlayerID_FreeParking, name: 'Free Parking', balance: 0 },
        label: 'Test Game',
        state: 'waiting-for-players',
      };
    }
    if (this._cachedGame.state != 'waiting-for-players') {
      return of({ exists: true, alreadyInProgrss: true, playerID: null });
    }
    return of({ exists: true, alreadyInProgrss: false, playerID: this._cachedGame.player.id });
  }

  gameCreate(request: GameCreateRequest): Observable<{ gameID: string; playerID: string }> {
    // Placeholder implementation
    this._cachedGame = {
      id: '1234',
      label: request.label,
      players: [
        { id: '1', name: 'Alice', balance: 1500 },
        { id: '2', name: 'Bob', balance: 1500 },
        { id: '5678', name: request.playerName, balance: 1500 },
        { id: '63', name: 'Peter', balance: -22 },
        { id: specialPlayerID_FreeParking, name: 'Free Parking', balance: 0 },
      ].filter((p) => p.id !== specialPlayerID_FreeParking || request.moneyOnFreeParking),
      player: { id: '5678', name: request.playerName, balance: 1500 },
      options: {
        moneyOnFreeParking: request.moneyOnFreeParking,
        doubleMoneyOnGo: request.doubleMoneyOnGo,
      },
      freeParking: request.moneyOnFreeParking
        ? { id: specialPlayerID_FreeParking, name: 'Free Parking', balance: 0 }
        : null,
      state: 'waiting-for-players',
    };
    return of({ gameID: this._cachedGame.id, playerID: this._cachedGame.player.id });
  }

  getGameData(gameID: string, playerID: string): Observable<GameDataResponse | null> {
    // Placeholder implementation
    if (!this._cachedGame) {
      this.gameJoin({ gameID, playerName: 'Tobias' });
    }
    return of(this._cachedGame);
  }

  executePayment(
    gameID: string,
    playerID: string,
    sourcePlayerID: string | null,
    targetPlayerID: string | null,
    amount: number,
  ) {
    if (gameID !== '1234' || !this._cachedGame) {
      return;
    }
    if (this._cachedGame.state === 'completed') {
      return;
    }
    if (this._cachedGame.state === 'waiting-for-players') {
      this._cachedGame.state = 'in-progress';
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
    this._cachedGame.freeParking = this._cachedGame.players.find(
      (p) => p.id === specialPlayerID_FreeParking,
    )!;

    setTimeout(() => {
      this.gameChanged.emit(this._cachedGame!);
    }, 500);
  }
}
