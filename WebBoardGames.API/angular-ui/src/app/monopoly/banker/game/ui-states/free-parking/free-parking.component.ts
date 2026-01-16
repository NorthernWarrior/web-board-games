import { Component, effect } from '@angular/core';
import { PaySendOrReceiveBaseComponent } from '../pay-send-or-receive-base.component';
import { FormsModule } from '@angular/forms';

@Component({
  imports: [FormsModule],
  selector: 'app-monopoly-banker-game-ui-state-free-parking',
  templateUrl: './free-parking.component.html',
  styleUrls: ['../../game-styles.scss', './free-parking.component.scss'],
})
export class MonopolyBankerGameUiStateFreeParkingComponent extends PaySendOrReceiveBaseComponent {
  constructor() {
    super();
    this._direction = 'receive';

    effect(() => {
      const freeParking = this.parent$().game()?.freeParking;
      this.otherPlayerID$.set(freeParking?.id ?? null);
      this.amount$.set(freeParking?.balance ?? 0);
    });
  }
}
