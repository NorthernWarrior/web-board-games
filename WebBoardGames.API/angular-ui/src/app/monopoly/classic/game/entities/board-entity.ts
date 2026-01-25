import { GameEntity } from 'app/engine';
import { Board } from '../../models/board';
import * as PIXI from 'pixi.js';
import {
  BOARD_BASE_COLOR,
  BOARD_SIZE,
  CENTER_SIZE,
  EDGE_SIZE,
  FIELD_SIZE,
  STROKE_NORMAL,
  STROKE_OUTLINE,
} from './constants';
import { FieldEntity } from './field-entity';

export class BoardEntity extends GameEntity {
  private readonly board: Board;

  constructor(board: Board) {
    super();
    this.board = board;
  }

  override onInitializeOverride(): void {
    //this.rotationDegrees = 45;
    this._createBoardGraphics(this.container);
  }

  override onUpdateOverride(delta: PIXI.Ticker): void {}

  private _createBoardGraphics(container: PIXI.Container<PIXI.ContainerChild>) {

    const outline = new PIXI.Graphics()
      .rect(
        0,
        0,
        CENTER_SIZE + EDGE_SIZE * 2 + STROKE_OUTLINE * 2,
        CENTER_SIZE + EDGE_SIZE * 2 + STROKE_OUTLINE * 2,
      )
      .stroke({ width: STROKE_OUTLINE, color: 0x000000, alignment: 1 });
    outline.pivot.x = outline.width / 2;
    outline.pivot.y = outline.height / 2;
    container.addChild(outline);

    const center = new PIXI.Graphics()
      .rect(0, 0, CENTER_SIZE, CENTER_SIZE)
      .fill(BOARD_BASE_COLOR)
      .stroke({ width: STROKE_NORMAL, color: 0x000000, alignment: 1 });
    center.pivot.x = center.width / 2;
    center.pivot.y = center.height / 2;
    container.addChild(center);

    for (let i = 0; i < 4; i++) {
      const field = new FieldEntity(this.board, this.board.fields[i * 10]);
      this.addChild(field);
      // Place fields at the corners
      const angle = (45 + i * 90) * (Math.PI / 180);
      const radius = Math.sqrt(2) * (CENTER_SIZE / 2 + EDGE_SIZE / 2);
      field.X = radius * Math.cos(angle);
      field.Y = radius * Math.sin(angle);
      field.rotationDegrees = i * 90;
    }

    for (let i = 0; i < 9; i++) {
      const fieldBottom = new FieldEntity(this.board, this.board.fields[i + 1]);
      this.addChild(fieldBottom);
      fieldBottom.X = CENTER_SIZE / 2 - FIELD_SIZE / 2 - FIELD_SIZE * i;
      fieldBottom.Y = CENTER_SIZE / 2 + EDGE_SIZE / 2;
      fieldBottom.rotationDegrees = 0;

      const fieldLeft = new FieldEntity(this.board, this.board.fields[i + 1 + 10]);
      this.addChild(fieldLeft);
      fieldLeft.X = -CENTER_SIZE / 2 - EDGE_SIZE / 2;
      fieldLeft.Y = CENTER_SIZE / 2 - FIELD_SIZE / 2 - FIELD_SIZE * i;
      fieldLeft.rotationDegrees = 90;

      const fieldTop = new FieldEntity(this.board, this.board.fields[i + 1 + 20]);
      this.addChild(fieldTop);
      fieldTop.X = -CENTER_SIZE / 2 + FIELD_SIZE / 2 + FIELD_SIZE * i;
      fieldTop.Y = -CENTER_SIZE / 2 - EDGE_SIZE / 2;
      fieldTop.rotationDegrees = 180;

      const fieldRight = new FieldEntity(this.board, this.board.fields[i + 1 + 30]);
      this.addChild(fieldRight);
      fieldRight.X = CENTER_SIZE / 2 + EDGE_SIZE / 2;
      fieldRight.Y = -CENTER_SIZE / 2 + FIELD_SIZE / 2 + FIELD_SIZE * i;
      fieldRight.rotationDegrees = 270;
    }
  }
}
