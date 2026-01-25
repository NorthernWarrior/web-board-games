import * as PIXI from 'pixi.js';

export class GameEntity {
  private _app: PIXI.Application | null = null;
  set app(value: PIXI.Application | null) {
    this._app = value;
  }
  get app(): PIXI.Application | null {
    return this._app;
  }

  private readonly _container: PIXI.Container<PIXI.ContainerChild> = new PIXI.Container();
  get container(): PIXI.Container<PIXI.ContainerChild> {
    return this._container;
  }

  private readonly _children: GameEntity[] = [];

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
    entity.app = this.app;
    this._container.addChild(entity.container);
  }

  onInitialize(): void {
    this.onInitializeOverride();
    for (const child of this._children) {
      child.onInitialize();
    }
  }

  onInitializeOverride(): void {}

  onUpdate(delta: PIXI.Ticker): void {
    this.onUpdateOverride(delta);
    for (const child of this._children) {
      child.onUpdate(delta);
    }
  }

  onUpdateOverride(delta: PIXI.Ticker): void {}
}
