import { AfterViewInit, Component, Inject, PLATFORM_ID, signal } from '@angular/core';
import { Board } from '../models/board';
import { GameEngine, GameEngineCanvasComponent } from 'app/engine';
import { BoardEntity } from './entities/board-entity';

@Component({
  imports: [GameEngineCanvasComponent],
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
})
export class MonopolyClassicGameComponent  {

  readonly board = signal<Board>(null!);

  constructor() {
    const board = new Board();
    board.reset();
    board.addPlayer('1', 'Tobi', 'car', 1500);
    board.addPlayer('2', 'Bob', 'ship', 1500);
    board.addPlayer('3', 'Charlie', 'shoe', 1500);
    board.addPlayer('4', 'Alice', 'iron', 1500);
    this.board.set(board);
  }

  onEngineInitialized($event: GameEngine) {
    $event.addEntity(new BoardEntity(this.board(), "1"));
  }
}
