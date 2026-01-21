import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ActivatedRoute, Router } from '@angular/router';
import { NgTemplateOutlet } from '@angular/common';
import { ApiService, GameCreateRequest, GameJoinRequest } from 'app/api/api-service';
import { environment } from 'environments/environment';
import { RecentGame, RecentGamesService } from '../services/recent-games.service';



@Component({
  imports: [
    ReactiveFormsModule,
    NgTemplateOutlet,
    MatButtonModule,
    MatInputModule,
    MatSlideToggleModule,
  ],
  templateUrl: './lobby.component.html',
  styleUrls: ['../game-styles.scss', './lobby.component.scss'],
})
export class MonopolyBankerLobbyComponent {
  private readonly _api = inject(ApiService);
  private readonly _router = inject(Router);
  private readonly _route = inject(ActivatedRoute);
  private readonly _recentGamesService = inject(RecentGamesService);

  readonly formJoin: FormGroup;
  readonly formCreate: FormGroup;

  readonly year = new Date().getFullYear();
  readonly version = environment.version;

  readonly recentGames = signal<RecentGame[]>([]);

  constructor(fb: FormBuilder, route: ActivatedRoute) {
    this.formJoin = fb.group<GameJoinRequest>({
      gameID: '',
      playerName: '',
    });
    this.formJoin.controls['gameID'].addValidators([Validators.required]);
    this.formJoin.controls['playerName'].addValidators([Validators.required]);

    this.formCreate = fb.group<GameCreateRequest>({
      label: '',
      playerName: '',
      moneyOnFreeParking: true,
      doubleMoneyOnGo: true,
    });
    this.formCreate.controls['label'].addValidators([Validators.required]);
    this.formCreate.controls['playerName'].addValidators([Validators.required]);

    const gameIDFromQuery = route.snapshot.queryParamMap.get('game');
    if (gameIDFromQuery) {
      this.formJoin.controls['gameID'].setValue(gameIDFromQuery);
    }

    this._recentGamesService.getRecentGames$().subscribe(games => {
      this.recentGames.set(games.sort((a, b) => b.gameLabel.localeCompare(a.gameLabel)));
    });
  }

  onGameJoin(): void {
    if (!this.formJoin.valid) {
      return;
    }
    const gameID = this.formJoin.value.gameID;
    this._api.gameJoin(this.formJoin.value).subscribe({
      next: (result) => {
        if (result.exists && result.playerID) {
          this.onNavigateToGame(gameID, result.playerID);
        } else if (!result.exists) {
          this.formJoin.controls['gameID'].setErrors({ notExists: true });
        } else {
          this.formJoin.controls['gameID'].setErrors({ alreadyInProgress: true });
        }
      },
      error: (err) => {
        console.error('Error checking game existence:', err);
      },
    });
  }

  onGameCreate(): void {
    if (!this.formCreate.valid) {
      return;
    }
    const gameRequest = this.formCreate.value;

    this._api.gameCreate(gameRequest).subscribe({
      next: (result) => {
        this.onNavigateToGame(result.gameID, result.playerID);
      },
      error: (err) => {
        console.error('Error creating game:', err);
      },
    });
  }

  onRecentGameSelect(game: RecentGame): void {
    this.onNavigateToGame(game.gameID, game.playerID);
  }

  onNavigateToGame(gameID: string, playerID: string): void {
    this._router.navigate([`${gameID}`], {
      relativeTo: this._route,
      queryParams: { player: playerID },
    });
  }
}
