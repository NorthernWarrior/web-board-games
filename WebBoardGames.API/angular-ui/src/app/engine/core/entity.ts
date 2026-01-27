import * as PIXI from 'pixi.js';
import { GameEngine } from './engine';

export class GameEntity {
  private _engine: GameEngine | null = null;
  private _app: PIXI.Application | null = null;
  private readonly _children: GameEntity[] = [];
  private _childrenAdded: GameEntity[] = [];
  private _parent: GameEntity | null = null;

  set engine(value: GameEngine | null) {
    this._engine = value;
  }
  get engine(): GameEngine | null {
    return this._engine;
  }

  set app(value: PIXI.Application | null) {
    this._app = value;
  }
  get app(): PIXI.Application | null {
    return this._app;
  }

  get parent(): GameEntity | null {
    return this._parent;
  }

  private readonly _container: PIXI.Container<PIXI.ContainerChild> = new PIXI.Container();
  get container(): PIXI.Container<PIXI.ContainerChild> {
    return this._container;
  }

  public get X(): number {
    return this.container.x;
  }
  public set X(value: number) {
    this.container.x = value;
  }

  public get Y(): number {
    return this.container.y;
  }
  public set Y(value: number) {
    this.container.y = value;
  }

  public get rotationDegrees(): number {
    return (this.container.rotation * 180) / Math.PI;
  }
  public set rotationDegrees(value: number) {
    this.container.rotation = (value * Math.PI) / 180;
  }

  addChild(entity: GameEntity): void {
    this._children.push(entity);
    entity.engine = this.engine;
    entity.app = this.app;
    entity._parent = this;
    this._container.addChild(entity.container);
    this._childrenAdded.push(entity);
  }

  removeChild(entity: GameEntity) {
    this._children.splice(this._children.indexOf(entity), 1);
    this._container.removeChild(entity.container);
    entity.container.destroy({ children: true });
  }

  onInitialize(): void {
    this.onInitializeOverride();
  }

  onInitializeOverride(): void {}

  onUpdate(delta: PIXI.Ticker): void {
    if (this._childrenAdded.length > 0) {
      for (const child of this._childrenAdded) {
        child.onInitialize();
      }
      this._childrenAdded = [];
    }

    this.onUpdateOverride(delta);
    for (const child of this._children) {
      child.onUpdate(delta);
    }
  }

  onUpdateOverride(delta: PIXI.Ticker): void {}

  onAnimationFrame(delta: PIXI.Ticker): void {
    this.onAnimationFrameOverride(delta);
    for (const child of this._children) {
      child.onAnimationFrame(delta);
    }
  }
  onAnimationFrameOverride(delta: PIXI.Ticker): void {}

  //#region Fluent API
  withPosition(x: number, y: number): this {
    this.X = x;
    this.Y = y;
    return this;
  }
  withRotationDegrees(rotationDegrees: number): this {
    this.rotationDegrees = rotationDegrees;
    return this;
  }
  //#endregion
}
