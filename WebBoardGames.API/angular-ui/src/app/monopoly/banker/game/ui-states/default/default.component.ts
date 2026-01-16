import { Component, input } from '@angular/core';
import { MonopolyBankerGameComponent } from '../../game.component';
import { DecimalPipe } from '@angular/common';

@Component({
  imports: [DecimalPipe],
  selector: 'app-monopoly-banker-game-ui-state-default',
  templateUrl: './default.component.html',
  styleUrls: ['../../game-styles.scss', './default.component.scss'],
})
export class MonopolyBankerGameUiStateDefaultComponent {
  public readonly parent$ = input.required<MonopolyBankerGameComponent>();
}
