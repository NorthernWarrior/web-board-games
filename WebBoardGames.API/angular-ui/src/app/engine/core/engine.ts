import { BoardEntity } from 'app/monopoly/classic/game/entities/board-entity';
import { GameEntity } from './entity';
import * as PIXI from 'pixi.js';

export class GameEngine {
  private readonly _entities: GameEntity[] = [];
  private readonly _rootContainer: PIXI.Container<PIXI.ContainerChild> =
    new PIXI.Container<PIXI.ContainerChild>();
  private _app: PIXI.Application | null = null;
  private _entitiesAdded: GameEntity[] = [];

  private _isPanning = false;
  private _lastPanPosition: { x: number; y: number } | null = null;

  constructor(clearColor: PIXI.ColorSource) {
    (async () => {
      this._app = new PIXI.Application();
      await this._app.init({
        backgroundColor: clearColor,
        resizeTo: document.body,
      });
      this._rootContainer.scale = new PIXI.Point(0.25, 0.25);

      document.body.appendChild(this._app.canvas);

      this._app.stage.addChild(this._rootContainer);

      this._app.ticker.add((delta) => {
        this._rootContainer!.x = this._app!.screen.width / 2;
        this._rootContainer!.y = this._app!.screen.height / 2;

        if (this._entitiesAdded.length > 0) {
          for (const entity of this._entitiesAdded) {
            entity.onInitialize();
          }
          this._entitiesAdded = [];
        }

        this._onUpdate(delta);
      });

      this._app.canvas.addEventListener(
        'wheel',
        (event) => {
          event.preventDefault();
          const scaleAmount = event.deltaY < 0 ? 1.1 : 0.9;
          this._rootContainer!.scale.x *= scaleAmount;
          this._rootContainer!.scale.y *= scaleAmount;
        },
        { passive: false },
      );
      this._app.canvas.addEventListener('mousedown', (e) => {
        if (e.button === 0 && e.ctrlKey) {
          this._isPanning = true;
          this._lastPanPosition = { x: e.clientX, y: e.clientY };
        }
      });

      window.addEventListener('mousemove', (e) => {
        if (this._isPanning) {
          const dx = e.clientX - this._lastPanPosition!.x;
          const dy = e.clientY - this._lastPanPosition!.y;
          // Adjust for current scale so panning is consistent at all zoom levels
          const scale = this._rootContainer.scale.x; // assuming uniform scaling
          this._rootContainer.pivot.x -= dx / scale;
          this._rootContainer.pivot.y -= dy / scale;
          this._lastPanPosition = { x: e.clientX, y: e.clientY };
        }
      });

      window.addEventListener('mouseup', () => {
        this._isPanning = false;
      });
    })();
  }

  addEntity(entity: BoardEntity) {
    this._entities.push(entity);
    this._rootContainer?.addChild(entity.container);
    entity.app = this._app;
    this._entitiesAdded.push(entity);
  }

  private _onUpdate(delta: PIXI.Ticker) {
    for (const entity of this._entities) {
      entity.onUpdate(delta);
    }
  }
}
