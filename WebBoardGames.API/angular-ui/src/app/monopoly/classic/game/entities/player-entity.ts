import { GameEntity } from 'app/engine';
import { Player } from '../../models/player';
import { FigureEntity } from './figure-entity';
import { BoardEntity } from './board-entity';
import { UI_SCALE } from './constants';
import { SimpleAnimation } from 'app/engine/animation/simple-animation';

export class PlayerEntity extends GameEntity {
  private readonly _figure: FigureEntity;
  private _currentFieldIndex: number = 0;

  constructor(
    private _board: BoardEntity,
    private _player: Player,
    private _isMyPlayer: boolean = false,
  ) {
    super();
    this._figure = new FigureEntity(this._player.figureType, this._isMyPlayer);
    this.addChild(this._figure);
  }

  get id(): string {
    return this._player.id;
  }
  get name(): string {
    return this._player.name;
  }

  override onInitializeOverride(): void {
    const position = this._board.getPositionForField(this._player.currentFieldIndex, true);
    const randomOffsetX = (Math.random() - 0.5) * 30 * UI_SCALE;
    const randomOffsetY = (Math.random() - 0.5) * 30 * UI_SCALE;
    this._figure.container.x = position.x + randomOffsetX;
    this._figure.container.y = position.y + randomOffsetY;
    this.container.zIndex = this._isMyPlayer ? 20 : 10;
    this._currentFieldIndex = this._player.currentFieldIndex;
  }

  public move(steps: number) {
    const fieldIndices = this._player.move(steps);
    this._board.enqueueModelAnimation(this._createMoveAnimation(fieldIndices));
    this._currentFieldIndex = this._player.currentFieldIndex;
  }

  private _createMoveAnimation(fieldIndices: number[]): SimpleAnimation {
    const speed = 20;
    const animation = new SimpleAnimation();
    for (let i = 0; i < fieldIndices.length; i++) {
      animation
        .add(
          () => {
            const idx = fieldIndices[i];
            const position = this._board.getPositionForField(idx, true);
            const rotation = this._board.getRotationForField(idx);
            const randomOffsetX = (Math.random() - 0.5) * 10 * UI_SCALE;
            const randomOffsetY = (Math.random() - 0.5) * 10 * UI_SCALE;
            position.x += randomOffsetX;
            position.y += randomOffsetY;
            const direction = {
              x: position.x - this._figure.container.x,
              y: position.y - this._figure.container.y,
            };
            const length = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
            direction.x /= length;
            direction.y /= length;
            return { idx, targetPosition: position, dir: direction, targetRotation: rotation };
          },
          (ctx, delta) => {
            const moveDistance = speed * delta;
            const toTargetX = ctx.data!.targetPosition.x - this._figure.container.x;
            const toTargetY = ctx.data!.targetPosition.y - this._figure.container.y;
            const toTargetLength = Math.sqrt(toTargetX * toTargetX + toTargetY * toTargetY);
            if (moveDistance >= toTargetLength) {
              this._figure.container.x = ctx.data!.targetPosition.x;
              this._figure.container.y = ctx.data!.targetPosition.y;
              return true;
            }
            this._figure.container.x += ctx.data!.dir.x * moveDistance;
            this._figure.container.y += ctx.data!.dir.y * moveDistance;
            return false;
          },
        )
        .addSimple((ctx, delta) => {
          if (Math.abs(ctx.data!.targetRotation - this._figure.rotationDegrees) <= 0.1) {
            return true;
          }
          const rotationSpeed = 2;
          const targetRotation = ctx.data!.targetRotation;
          let currentRotation = this._figure.rotationDegrees;
          this._figure.rotationDegrees += rotationSpeed * delta;
          let rotationDifference = (targetRotation - currentRotation) % 360;
          if (Math.abs(rotationDifference) <= 1) {
            this._figure.rotationDegrees = targetRotation;
            return true;
          }
          return false;
        });
    }
    return animation;
  }
}
