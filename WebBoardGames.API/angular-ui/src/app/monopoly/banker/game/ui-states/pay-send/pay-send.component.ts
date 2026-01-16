import { Component } from '@angular/core';
import { PaySendOrReceiveBaseComponent } from '../pay-send-or-receive-base.component';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    imports: [DecimalPipe, FormsModule],
  selector: 'app-monopoly-banker-game-ui-state-pay-send',
  templateUrl: './pay-send.component.html',
  styleUrls: ['../../game-styles.scss', './pay-send.component.scss'],
})
export class MonopolyBankerGameUiStatePaySendComponent extends PaySendOrReceiveBaseComponent {
  constructor() {
    super();
    this._direction = 'send';
  }
}
