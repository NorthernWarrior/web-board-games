import { Directive, input, signal } from '@angular/core';
import { MonopolyBankerGameComponent } from '../game.component';

export type PayDirection = 'send' | 'receive';

@Directive()
export abstract class PaySendOrReceiveBaseComponent {
  public readonly parent$ = input.required<MonopolyBankerGameComponent>();
  public readonly otherPlayerID$ = signal<string | null>(null);
  public readonly amount$ = signal<number>(0);
  protected _direction: PayDirection = 'send';

  onAmountIncrease(amount: number) {
    this.amount$.set(this.amount$() + amount);
  }

  onCancel() {
    this._reset();
    this.parent$().uiState.set('default');
  }

  canAccept(): boolean {
    return this.amount$() !== 0;
  }
  onAccept() {
    const parent = this.parent$();
    parent.onExecutePayment(
      this._direction === 'send' ? parent.playerID() : this.otherPlayerID$(),
      this._direction === 'send' ? this.otherPlayerID$() : parent.playerID(),
      this.amount$()
    );
    this._reset();
    this.parent$().uiState.set('default');
  }

  private _reset() {
    this.amount$.set(0);
    this.otherPlayerID$.set(null);
  }
}
