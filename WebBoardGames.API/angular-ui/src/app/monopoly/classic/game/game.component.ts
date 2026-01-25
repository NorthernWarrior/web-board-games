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
    this.board.set(board);
  }

  onEngineInitialized($event: GameEngine) {
    $event.addEntity(new BoardEntity(this.board()));
  }
}
