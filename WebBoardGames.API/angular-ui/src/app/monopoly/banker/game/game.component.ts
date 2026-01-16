import { Component, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService, GameDataResponse } from '../../../api/api-service';
import { MonopolyBankerGameUiStateDefaultComponent } from './ui-states/default/default.component';
import { MonopolyBankerGameUiStatePaySendComponent } from './ui-states/pay-send/pay-send.component';
import { MonopolyBankerGameUiStatePayReceiveComponent } from './ui-states/pay-receive/pay-receive.component';
import { MonopolyBankerGameUiStatePassedGoComponent } from './ui-states/passed-go/passed-go.component';
import { SharedComponentsModule } from '../../../shared-components/shared-components.module';
import { MonopolyBankerGameUiStateFreeParkingComponent } from './ui-states/free-parking/free-parking.component';

type UiState = 'default' | 'pay-send' | 'pay-receive' | 'passed-go' | 'free-parking';

@Component({
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    SharedComponentsModule,
    MonopolyBankerGameUiStateDefaultComponent,
    MonopolyBankerGameUiStatePaySendComponent,
    MonopolyBankerGameUiStatePayReceiveComponent,
    MonopolyBankerGameUiStatePassedGoComponent,
    MonopolyBankerGameUiStateFreeParkingComponent,
  ],
  templateUrl: './game.component.html',
  styleUrls: ['./game-styles.scss', './game.component.scss'],
})
export class MonopolyBankerGameComponent {
  private readonly _api = inject(ApiService);
  private readonly _router = inject(Router);
  private readonly _gameID: string;
  public readonly playerID = signal<string>('');

  public readonly game = signal<GameDataResponse | null>(null);
  public readonly otherPlayersWithBancrupt = computed(() => {
    const currentGame = this.game();
    if (!currentGame) {
      return [];
    }
    return currentGame.players.filter((p) => p.id !== this.playerID());
  });
  public readonly otherPlayers = computed(() => {
    const currentGame = this.game();
    if (!currentGame) {
      return [];
    }
    return currentGame.players.filter((p) => p.id !== this.playerID() && (p.balance > 0 || p.id === 'free-parking'));
  });
  public readonly otherPlayersWithoutFreeParking = computed(() => {
    const currentGame = this.game();
    if (!currentGame) {
      return [];
    }
    return currentGame.players.filter((p) => p.id !== this.playerID() && p.balance > 0 && p.id !== 'free-parking');
  });

  public readonly uiState = signal<UiState>('default');

  constructor(route: ActivatedRoute) {
    this._gameID = route.snapshot.params['game_id'];
    this.playerID.set(route.snapshot.queryParams['player']);
    if (!this._gameID) {
      console.error(new Error('game_id is required to access the game component.'));
      this.onGameExit();
      return;
    }
    if (!this.playerID()) {
      console.error(
        new Error('"player" query parameter is required to access the game component.'),
      );
      this.onGameExit();
      return;
    }

    this._refreshGameData();
    this._api.gameChanged.subscribe((updatedGame) => {
      if (updatedGame.id !== this._gameID) {
        return;
      }
      this.game.set(updatedGame);
    });
  }

  onGameExit(): void {
    this._router.navigate(['/monopoly/banker']);
  }

  canGameShare(): boolean {
    return !!navigator.share && this.game()?.state === 'waiting-for-players';
  }
  onGameShare(): void {
    if (!this.canGameShare()) {
      return;
    }
    const url = window.location.href.split('?')[0];
    console.log('Sharing game link:', url);
    navigator
      .share({
        title: 'Join my Monopoly Game!',
        text: `Come join my Monopoly Game "${this.game()?.label}"`,
        url: url.split('?')[0],
      })
      .catch((error) => {
        // Optionally handle errors here
        console.error('Error sharing:', error);
      });
  }

  onExecutePayment(sourcePlayerID: string | null, targetPlayerID: string | null, amount: number) {
    this._api.executePayment(this._gameID, this.playerID(), sourcePlayerID, targetPlayerID, amount);
  }

  onPaySend() {
    this.uiState.set('pay-send');
  }
  onPayReceive() {
    this.uiState.set('pay-receive');
  }

  onPaymentGo() {
    this.uiState.set('passed-go');
    // const playerID = this.playerID();
    // this._api.executePayment(this._gameID, playerID, null, playerID, 200);
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
    this.uiState.set("free-parking");
  }

  private _refreshGameData(): void {
    this._api.getGameData(this._gameID, this.playerID()).subscribe({
      next: (data) => {
        this.game.set(data);
      },
      error: (err) => {
        console.error('Error fetching game data:', err);
      },
    });
  }
}
