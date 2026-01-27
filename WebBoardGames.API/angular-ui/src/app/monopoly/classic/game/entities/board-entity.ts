import { GameEntity } from 'app/engine';
import { Board } from '../../models/board';
import * as PIXI from 'pixi.js';
import {
  BOARD_BASE_COLOR,
  CENTER_SIZE,
  EDGE_SIZE,
  FIELD_SIZE,
  STROKE_NORMAL,
  STROKE_OUTLINE,
  UI_SCALE,
} from './constants';
import { FieldEntity } from './field-entity';
import { CardStackEntity } from './card-stack-entity';
import { SimpleAnimation } from 'app/engine/animation/simple-animation';
import { PlayerEntity } from './player-entity';
import { FieldId } from '../../models/fields';
import { testTurns, Turn, TurnPhase } from '../../models/turn';

export class BoardEntity extends GameEntity {
  private readonly board: Board;

  private _cardStackChance: CardStackEntity | null = null;
  private _cardStackCommunityChest: CardStackEntity | null = null;

  private _modalAnimationStack: SimpleAnimation[] = [];
  private _modalAnimationCurrent: SimpleAnimation | null = null;

  private _fieldEntities: Map<FieldId, FieldEntity> = new Map();
  private _playerEntities: Map<string, PlayerEntity> = new Map();
  private _currentPlayersTurn: number = 0;

  constructor(
    board: Board,
    private _myPlayerId: string,
  ) {
    super();
    this.board = board;
    this.board.turnsAdded.on('turns', this._onTurnsAdded.bind(this));
  }

  override onInitializeOverride(): void {
    if (this.engine?.getZoom() === 1) {
      this.engine?.setZoom(1 / UI_SCALE);
    }
    this._createBoardGraphics(this.container);
    for (const player of this.board.players) {
      const playerEntity = new PlayerEntity(this, player, player.id === this._myPlayerId);
      this._playerEntities.set(player.id, playerEntity);
      this.addChild(playerEntity);
    }

    window.addEventListener('keydown', (event) => {
      if (event.key === ' ') {
        const currentPlayer = this.board.players[this._currentPlayersTurn];
        const entity = this._playerEntities.get(currentPlayer.id);
        if (!entity) {
          console.warn(
            `No entity found for player ${currentPlayer.name} with ID ${currentPlayer.id}`,
          );
          return;
        }
        const diceRolls = [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1];
        const pasch = diceRolls[0] === diceRolls[1];
        console.log(
          `${currentPlayer.name} rolled a ${diceRolls[0] + diceRolls[1]} - pasch: ${pasch} (${diceRolls[0]}, ${diceRolls[1]})`,
        );

        entity.move(diceRolls[0] + diceRolls[1]);

        if (!pasch) {
          this._currentPlayersTurn = (this._currentPlayersTurn + 1) % this.board.players.length;
        }

        //this._cardStackCommunityChest?.drawCard();
      }
    });

    setTimeout(() => {
      this.board.addTurns(testTurns);
    }, 200);
  }

  public enqueueModelAnimation(animation: SimpleAnimation) {
    this._modalAnimationStack.push(animation);
  }

  public getPositionForField(
    fieldIdOrIndex: FieldId | number,
    inLocalPosition: boolean = false,
  ): { x: number; y: number } {
    if (typeof fieldIdOrIndex === 'number') {
      fieldIdOrIndex = this.board.fields[fieldIdOrIndex].id;
    }
    const fieldEntity = this._fieldEntities.get(fieldIdOrIndex);
    if (!fieldEntity) {
      throw new Error(`Field entity not found for field ID: ${fieldIdOrIndex}`);
    }
    if (!inLocalPosition) {
      return fieldEntity.container.getGlobalPosition();
    }
    return { x: fieldEntity.X, y: fieldEntity.Y };
  }
  getRotationForField(fieldIdOrIndex: FieldId | number) {
    if (typeof fieldIdOrIndex === 'number') {
      fieldIdOrIndex = this.board.fields[fieldIdOrIndex].id;
    }
    const fieldEntity = this._fieldEntities.get(fieldIdOrIndex);
    if (!fieldEntity) {
      throw new Error(`Field entity not found for field ID: ${fieldIdOrIndex}`);
    }
    return fieldEntity.rotationDegrees;
  }

  override onUpdateOverride(delta: PIXI.Ticker): void {}

  override onAnimationFrameOverride(delta: PIXI.Ticker): void {
    if (this._modalAnimationCurrent) {
      const finished = this._modalAnimationCurrent.animate(delta.deltaTime, delta.elapsedMS);
      if (!finished) {
        return;
      }
      this._modalAnimationCurrent = null;
    }
    if (this._modalAnimationStack.length > 0) {
      this._modalAnimationCurrent = this._modalAnimationStack.shift()!;
      this._modalAnimationCurrent.start();
    }
  }

  private _onTurnsAdded(turns: Turn[]) {
    (async () => {
      for (const turn of turns) {          
        await this._waitForModalAnimationsAsync();
        const playerEntity = this._playerEntities.get(turn.playerID);
        if (!playerEntity) {
          console.warn(`No player entity found for player ID: ${turn.playerID}`);
          continue;
        }
        for (const phase of turn.phases) {
          await this._handlePhaseAsync(playerEntity, phase);
        }
      }
    })();
  }

  private async _handlePhaseAsync(playerEntity: PlayerEntity, phase: TurnPhase) {
    console.log("handle phase", phase.type, " for player ", playerEntity.name)
    switch (phase.type) {
      case 'move': {
        playerEntity.move(phase.data.steps);
        break;
      }
      case 'pay': {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        break;
      }
      case "card-action": {
        const stack = phase.data.cardType === "chance" ? this._cardStackChance : this._cardStackCommunityChest;
        const card = stack?.drawCard(phase.data.cardIndex, true);
        await this._waitForModalAnimationsAsync();
        break;
      }
      case 'buy-property': {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        break;
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  private _waitForModalAnimationsAsync() {
    return new Promise<void>((resolve) => {
      const checkInterval = setInterval(() => {
        if (this._modalAnimationStack.length === 0 && !this._modalAnimationCurrent) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 200);
    });
  }

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
      this._fieldEntities.set(field.field.id, field);
      // Place fields at the corners
      const angle = (45 + i * 90) * (Math.PI / 180);
      const radius = Math.sqrt(2) * (CENTER_SIZE / 2 + EDGE_SIZE / 2);
      field.X = radius * Math.cos(angle);
      field.Y = radius * Math.sin(angle);
      field.rotationDegrees = i * 90;
    }

    for (let i = 0; i < 9; i++) {
      const fieldBottom = new FieldEntity(this.board, this.board.fields[i + 1]);
      this._fieldEntities.set(fieldBottom.field.id, fieldBottom);
      this.addChild(fieldBottom);
      fieldBottom.X = CENTER_SIZE / 2 - FIELD_SIZE / 2 - FIELD_SIZE * i;
      fieldBottom.Y = CENTER_SIZE / 2 + EDGE_SIZE / 2;
      fieldBottom.rotationDegrees = 0;

      const fieldLeft = new FieldEntity(this.board, this.board.fields[i + 1 + 10]);
      this._fieldEntities.set(fieldLeft.field.id, fieldLeft);
      this.addChild(fieldLeft);
      fieldLeft.X = -CENTER_SIZE / 2 - EDGE_SIZE / 2;
      fieldLeft.Y = CENTER_SIZE / 2 - FIELD_SIZE / 2 - FIELD_SIZE * i;
      fieldLeft.rotationDegrees = 90;

      const fieldTop = new FieldEntity(this.board, this.board.fields[i + 1 + 20]);
      this._fieldEntities.set(fieldTop.field.id, fieldTop);
      this.addChild(fieldTop);
      fieldTop.X = -CENTER_SIZE / 2 + FIELD_SIZE / 2 + FIELD_SIZE * i;
      fieldTop.Y = -CENTER_SIZE / 2 - EDGE_SIZE / 2;
      fieldTop.rotationDegrees = 180;

      const fieldRight = new FieldEntity(this.board, this.board.fields[i + 1 + 30]);
      this._fieldEntities.set(fieldRight.field.id, fieldRight);
      this.addChild(fieldRight);
      fieldRight.X = CENTER_SIZE / 2 + EDGE_SIZE / 2;
      fieldRight.Y = -CENTER_SIZE / 2 + FIELD_SIZE / 2 + FIELD_SIZE * i;
      fieldRight.rotationDegrees = 270;
    }

    const cardStackOffset = 120 * UI_SCALE;
    this.addChild(
      (this._cardStackCommunityChest = new CardStackEntity(
        this.board,
        'community-chest',
        this.board.cardsCommunityChest,
      ).withPosition(-CENTER_SIZE / 2 + cardStackOffset, -CENTER_SIZE / 2 + cardStackOffset)),
    );
    this.addChild(
      (this._cardStackChance = new CardStackEntity(
        this.board,
        'chance',
        this.board.cardsChance,
      ).withPosition(CENTER_SIZE / 2 - cardStackOffset, CENTER_SIZE / 2 - cardStackOffset)),
    );
  }
}
