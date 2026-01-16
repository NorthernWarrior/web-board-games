import { Component } from '@angular/core';
import { PaySendOrReceiveBaseComponent } from '../pay-send-or-receive-base.component';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  imports: [DecimalPipe, FormsModule],
  selector: 'app-monopoly-banker-game-ui-state-pay-receive',
  templateUrl: './pay-receive.component.html',
  styleUrls: ['../../game-styles.scss', './pay-receive.component.scss'],
})
export class MonopolyBankerGameUiStatePayReceiveComponent extends PaySendOrReceiveBaseComponent {
  constructor() {
    super();
    this._direction = 'receive';
  }
}
