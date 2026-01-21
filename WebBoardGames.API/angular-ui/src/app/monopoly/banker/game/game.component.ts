import { Component, computed, inject, PLATFORM_ID, signal } from '@angular/core';
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
import { isPlatformBrowser } from '@angular/common';
import { first, share } from 'rxjs';
import { RecentGamesService } from '../services/recent-games.service';

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
  styleUrls: ['../game-styles.scss', './game.component.scss'],
})
export class MonopolyBankerGameComponent {
  private readonly _api = inject(ApiService);
  private readonly _router = inject(Router);
  private readonly _platformId = inject(PLATFORM_ID);
  private readonly _recentGamesService = inject(RecentGamesService);
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
    return currentGame.players.filter(
      (p) => p.id !== this.playerID() && (p.balance > 0 || p.id === 'free-parking'),
    );
  });
  public readonly otherPlayersWithoutFreeParking = computed(() => {
    const currentGame = this.game();
    if (!currentGame) {
      return [];
    }
    return currentGame.players.filter(
      (p) => p.id !== this.playerID() && p.balance > 0 && p.id !== 'free-parking',
    );
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
  }

  onGameExit(): void {
    this._router.navigate(['/monopoly/banker']);
  }

  canGameShare(): boolean {
    if (!isPlatformBrowser(this._platformId)) {
      return false;
    }
    return this.game()?.state === 'waiting-for-players';
  }
  onGameShare(): void {
    if (!this.canGameShare()) {
      return;
    }
    const l = window.location;
    const url = `${l.protocol}//${l.host}/monopoly/banker?game=${this._gameID}`;
    console.log('Sharing game link:', url);
    if (!!navigator.share) {
      navigator
        .share({
          title: 'Join my Monopoly Game!',
          text: `Come join my Monopoly Game "${this.game()?.label}"`,
          url: url,
        })
        .catch((error) => {
          // Optionally handle errors here
          console.error('Error sharing:', error);
        });
    } else if (navigator.clipboard) {
      // copy to clipboard as fallback
      navigator.clipboard.writeText(url).then(
        () => {
          console.log('Game link copied to clipboard:', url);
        },
        (err) => {
          console.error('Could not copy text: ', err);
        },
      );
    } else {
      prompt('Copy this link to share the game:', url);
    }
  }

  onExecutePayment(sourcePlayerID: string | null, targetPlayerID: string | null, amount: number) {
    this._api.paymentExecute(this._gameID, sourcePlayerID, targetPlayerID, amount);
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
    this.uiState.set('free-parking');
  }

  private _refreshGameData(): void {
    if (isPlatformBrowser(this._platformId)) {

      // Use a shared observable to avoid duplicate API calls
      const shared$ = this._api.getGameData(this._gameID, this.playerID()).pipe(share());

      // First event: Write game into recent games
      shared$.pipe(first()).subscribe({
        next: (g) => {
          if (!g || g.state === 'completed') {
            return;
          }
          this._recentGamesService.addRecentGame({
            gameID: g.id,
            gameLabel: g.label,
            playerID: g.player.id,
            playerName: g.player.name,
          });
        },
      });

      // Every event: update game signal
      shared$.subscribe({
        next: (data) => {
          this.game.set(data);
        },
        error: (err) => {
          console.error('Error fetching game data:', err);
        },
      });
    }
  }
}
