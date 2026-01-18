import { Component } from '@angular/core';
import { PaySendOrReceiveBaseComponent } from '../pay-send-or-receive-base.component';
import { FormsModule } from '@angular/forms';

@Component({
  imports: [FormsModule],
  selector: 'app-monopoly-banker-game-ui-state-passed-go',
  templateUrl: './passed-go.component.html',
  styleUrls: ['../../../game-styles.scss', './passed-go.component.scss'],
})
export class MonopolyBankerGameUiStatePassedGoComponent extends PaySendOrReceiveBaseComponent {

  constructor() {
    super();
    this._direction = 'receive';
    this.otherPlayerID$.set(null);
    this.amount$.set(200);
  }
}
