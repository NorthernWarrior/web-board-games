import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ApiService, GameCreateRequest, GameJoinRequest } from '../../../api/api-service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  imports: [ReactiveFormsModule, MatButtonModule, MatInputModule, MatSlideToggleModule],
  templateUrl: './lobby.component.html',
})
export class MonopolyBankerLobbyComponent {
  readonly formJoin: FormGroup;
  readonly formCreate: FormGroup;
  private readonly _api = inject(ApiService);
  private readonly _router = inject(Router);
  private readonly _route = inject(ActivatedRoute);

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
  }

  onGameJoin(): void {
    if (!this.formJoin.valid) {
      return;
    }
    const gameID = this.formJoin.value.gameID;
    console.log(`Joining game with ID: ${gameID}`);
    this._api.gameJoin(this.formJoin.value).subscribe({
      next: (result) => {
        if (result.exists && result.playerID) {
          console.log(`Game with ID: ${gameID} exists.`);
          this.onNavigateToGame(gameID, result.playerID);
        } else if (!result.exists) {
          console.log(`Game with ID: ${gameID} does not exist.`);
          this.formJoin.controls['gameID'].setErrors({ notExists: true });
        } else {
          console.log(`Game with ID: ${gameID} is already in progress.`);
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
    console.log(`Creating game with request: ${JSON.stringify(gameRequest)}`);

    this._api.gameCreate(gameRequest).subscribe({
      next: (result) => {
        console.log(`Game created with ID: ${result.gameID}`);
        this.onNavigateToGame(result.gameID, result.playerID);
      },
      error: (err) => {
        console.error('Error creating game:', err);
      },
    });
  }

  onNavigateToGame(gameID: string, playerID: string): void {
    console.log(`Navigating to game with ID: ${gameID} and player ID: ${playerID}`);
    this._router.navigate([`${gameID}`], { relativeTo: this._route, queryParams: { player: playerID } });
  }
}
