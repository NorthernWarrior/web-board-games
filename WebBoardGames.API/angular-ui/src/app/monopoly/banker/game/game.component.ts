import { Component, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService, GameDataResponse } from '../../../api/api-service';
import { DecimalPipe } from '@angular/common';

@Component({
  imports: [ReactiveFormsModule, MatButtonModule, MatInputModule, DecimalPipe],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss',
})
export class MonopolyBankerGameComponent {
  private readonly _api = inject(ApiService);
  private readonly _router = inject(Router);
  private readonly _gameID: string;
  readonly _playerID: string;

  public readonly game = signal<GameDataResponse | null>(null);
  public readonly otherPlayers = computed(() => {
    const currentGame = this.game();
    if (!currentGame) {
      return [];
    }
    return currentGame.players.filter((p) => p.id !== this._playerID);
  });

  constructor(route: ActivatedRoute) {
    this._gameID = route.snapshot.params['game_id'];
    this._playerID = route.snapshot.queryParams['player'];
    if (!this._gameID) {
      console.error(new Error('game_id is required to access the game component.'));
      this.onExitGame();
      return;
    }
    if (!this._playerID) {
      console.error(
        new Error('"player" query parameter is required to access the game component.')
      );
      this.onExitGame();
      return;
    }

    this._refreshGameData();
  }

  onExitGame(): void {
    this._router.navigate(['/monopoly/banker']);
  }

  onPayTowards() {
    const game = this.game();
    if (!game || !game.freeParking) { return; }
    this._api
      .executePayment(this._gameID, this._playerID, this._playerID, game.freeParking.id, 150)
      .subscribe(this._handleExecutePaymentResult.bind(this));
  }
  onPayReceive() {}

  onPaymentGo() {
    this._api
      .executePayment(this._gameID, this._playerID, null, this._playerID, 200)
      .subscribe(this._handleExecutePaymentResult.bind(this));
  }
  onFreeParking() {
    const game = this.game();
    if (
      !game ||
      !game.options.moneyOnFreeParking ||
      !game.freeParking ||
      game.freeParking.balance <= 0
    ) {
      return;
    }
    this._api
      .executePayment(
        this._gameID,
        this._playerID,
        game.freeParking.id,
        this._playerID,
        game.freeParking.balance
      )
      .subscribe(this._handleExecutePaymentResult.bind(this));
  }

  private _handleExecutePaymentResult(result: GameDataResponse | null): void {
    if (!result) {
      return;
    }
    this.game.set(result);
  }

  private _refreshGameData(): void {
    this._api.getGameData(this._gameID).subscribe({
      next: (data) => {
        this.game.set(data);
      },
      error: (err) => {
        console.error('Error fetching game data:', err);
      },
    });
  }
}
