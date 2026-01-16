import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { EventEmitter, Inject, inject, Injectable, PLATFORM_ID } from '@angular/core';
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
  private readonly _baseUrl = '';
  private readonly _client = inject(HttpClient);
  private readonly _platformId = inject(PLATFORM_ID);

  gameCreate(request: GameCreateRequest): Observable<{ gameID: string; playerID: string }> {
    return this._client.post<{ gameID: string; playerID: string }>(
      `${this._baseUrl}/api/monopoly/banker/create`,
      request,
    );
  }

  gameJoin(request: GameJoinRequest) {
    return this._client.post<{
      exists: boolean;
      alreadyInProgress: boolean;
      playerID: string | null;
    }>(`${this._baseUrl}/api/monopoly/banker/join`, request);
  }

  getGameData(gameID: string, playerID: string): Observable<GameDataResponse | null> {
    return new Observable<GameDataResponse | null>((observer) => {
      if (!isPlatformBrowser(this._platformId)) {
        observer.error('EventSource is only available in the browser');
        return;
      }
      const url = `${this._baseUrl}/api/monopoly/banker/${gameID}/stream?playerID=${playerID}`;
      const eventSource = new EventSource(url);

      eventSource.addEventListener('monopoly-banker-game-data', (event: MessageEvent) => {
        observer.next(JSON.parse(event.data, (key, value) => {
          if (key === "state" && typeof value === "number") {
            return ['waiting-for-players', 'in-progress', 'completed'][value];
          }
          return value;
        }));
      });

      eventSource.onerror = (error) => {
        observer.error(error);
        eventSource.close();
      };

      return () => {
        eventSource.close();
      };
    });
  }

  paymentExecute(
    gameID: string,
    sourcePlayerID: string | null,
    targetPlayerID: string | null,
    amount: number,
  ) {
    return this._client.post<{
      exists: boolean;
      alreadyInProgress: boolean;
      playerID: string | null;
    }>(`${this._baseUrl}/api/monopoly/banker/payment`, {
      gameID,
      sourcePlayerID,
      targetPlayerID,
      amount,
    }).subscribe();
  }
}
