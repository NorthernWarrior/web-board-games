import { GameEntity } from './entity';
import * as PIXI from 'pixi.js';

export class GameEngine {
  private readonly _entities: GameEntity[] = [];
  private readonly _rootContainer: PIXI.Container<PIXI.ContainerChild> =
    new PIXI.Container<PIXI.ContainerChild>();
  private _app: PIXI.Application | null = null;
  private _entitiesAdded: GameEntity[] = [];

  private _isDefaultMovementEnabled = false;
  private _isPanInitiated = false;
  private _isPanning = false;
  private _lastPanPosition: { x: number; y: number } | null = null;

  private _width = 0;
  private _height = 0;

  constructor(clearColor: PIXI.ColorSource, width = 0, height = 0) {
    this._width = width;
    this._height = height;
    (async () => {
      this._app = new PIXI.Application();

      const resizeTo = this._width > 0 || this._height > 0 ? undefined : document.body;
      await this._app.init({
        resizeTo: resizeTo,
        width: this._width > 0 ? this._width : undefined,
        height: this._height > 0 ? this._height : undefined,
        backgroundColor: clearColor,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        multiView: true,
      });

      document.body.appendChild(this._app.canvas);

      this._app.stage.addChild(this._rootContainer);

      this._app.ticker.add(this._onUpdate.bind(this), null, PIXI.UPDATE_PRIORITY.HIGH);
      this._app.ticker.add(this._onAnimationFrame.bind(this), null, PIXI.UPDATE_PRIORITY.LOW);

      this._app.canvas.addEventListener(
        'wheel',
        (event) => {
          if (!this._isDefaultMovementEnabled) {
            return;
          }
          event.preventDefault();
          if (this._rootContainer!.scale.x >= 1 && event.deltaY < 0) {
            return;
          }
          const scaleAmount = event.deltaY < 0 ? 1.1 : 0.9;
          this._rootContainer!.scale.x *= scaleAmount;
          this._rootContainer!.scale.y *= scaleAmount;
          this._rootContainer!.scale.x = Math.min(this._rootContainer!.scale.x, 1);
          this._rootContainer!.scale.y = Math.min(this._rootContainer!.scale.y, 1);
          sessionStorage.setItem('game-engine.zoom', this._rootContainer!.scale.x.toString());
        },
        { passive: false },
      );

      this._app.canvas.addEventListener('mousedown', (e) => {
        if (!this._isDefaultMovementEnabled) {
          return;
        }
        if (e.button === 0) {
          this._isPanInitiated = true;
          this._isPanning = false;
          this._lastPanPosition = { x: e.clientX, y: e.clientY };
        }
      });
      this._app.canvas.addEventListener('touchstart', (e) => {
        if (!this._isDefaultMovementEnabled) {
          return;
        }
        if (e.touches.length === 1) {
          this._isPanInitiated = true;
          this._isPanning = false;
          this._lastPanPosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
      });

      this._app.canvas.addEventListener(
        'touchmove',
        (e) => {
          if (!this._isDefaultMovementEnabled) {
            return;
          }
          if (this._isPanInitiated && e.touches.length === 1) {
            const dx = e.touches[0].clientX - this._lastPanPosition!.x;
            const dy = e.touches[0].clientY - this._lastPanPosition!.y;
            if (!this._isPanning && Math.abs(dx) < 10 && Math.abs(dy) < 10) {
              return;
            }
            this._isPanning = true;
            // Adjust for current scale so panning is consistent at all zoom levels
            const scale = this._rootContainer.scale.x; // assuming uniform scaling
            this._rootContainer.pivot.x -= dx / scale;
            this._rootContainer.pivot.y -= dy / scale;
            this._lastPanPosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
          }
          e.preventDefault();
        },
        { passive: false },
      );
      window.addEventListener('mousemove', (e) => {
        if (!this._isDefaultMovementEnabled) {
          return;
        }
        if (this._isPanInitiated) {
          const dx = e.clientX - this._lastPanPosition!.x;
          const dy = e.clientY - this._lastPanPosition!.y;
          if (!this._isPanning && Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
          this._isPanning = true;
          // Adjust for current scale so panning is consistent at all zoom levels
          const scale = this._rootContainer.scale.x; // assuming uniform scaling
          this._rootContainer.pivot.x -= dx / scale;
          this._rootContainer.pivot.y -= dy / scale;
          this._lastPanPosition = { x: e.clientX, y: e.clientY };
        }
      });

      this._app.canvas.addEventListener('touchend', () => {
        if (!this._isDefaultMovementEnabled) {
          return;
        }
        if (this._isPanning) {
          sessionStorage.setItem('game-engine.pivot.x', this._rootContainer!.pivot.x.toString());
          sessionStorage.setItem('game-engine.pivot.y', this._rootContainer!.pivot.y.toString());
        }
        this._isPanInitiated = false;
        this._isPanning = false;
      });
      window.addEventListener('mouseup', () => {
        if (!this._isDefaultMovementEnabled) {
          return;
        }
        if (this._isPanning) {
          sessionStorage.setItem('game-engine.pivot.x', this._rootContainer!.pivot.x.toString());
          sessionStorage.setItem('game-engine.pivot.y', this._rootContainer!.pivot.y.toString());
        }
        this._isPanInitiated = false;
        this._isPanning = false;
      });
    })();
  }

  resize(canvasWidth: number, canvasHeight: number) {
    this._width = canvasWidth;
    this._height = canvasHeight;
    if (!this._app?.renderer) {
      return;
    }
    if (this._width > 0 || this._height > 0) {
      this._app.resizeTo = null as any;
      this._app.renderer.resize(this._width, this._height);
    } else {
      this._app.renderer.resize(document.body.clientWidth, document.body.clientHeight);
      this._app.resizeTo = document.body;
    }
  }

  enableDefaultMovement() {
    this._isDefaultMovementEnabled = true;

    const savedZoom = sessionStorage.getItem('game-engine.zoom');
    if (savedZoom) {
      this._rootContainer.scale = new PIXI.Point(parseFloat(savedZoom), parseFloat(savedZoom));
    }
    const savedPivotX = sessionStorage.getItem('game-engine.pivot.x');
    const savedPivotY = sessionStorage.getItem('game-engine.pivot.y');
    if (savedPivotX && savedPivotY) {
      this._rootContainer.pivot.x = parseFloat(savedPivotX);
      this._rootContainer.pivot.y = parseFloat(savedPivotY);
    }
  }

  getZoom(): number {
    return this._rootContainer ? this._rootContainer.scale.x : 1;
  }
  setZoom(zoom: number) {
    if (!this._rootContainer) {
      return;
    }
    this._rootContainer.scale = new PIXI.Point(zoom, zoom);
    if (!this._isDefaultMovementEnabled) {
      return;
    }
    sessionStorage.setItem('game-engine.zoom', this._rootContainer!.scale.x.toString());
  }

  addEntity(entity: GameEntity) {
    this._entities.push(entity);
    this._rootContainer?.addChild(entity.container);
    entity.app = this._app;
    entity.engine = this;
    this._entitiesAdded.push(entity);
  }

  private _onUpdate(delta: PIXI.Ticker) {
    this._rootContainer!.x = this._app!.screen.width / 2;
    this._rootContainer!.y = this._app!.screen.height / 2;
    if (this._entitiesAdded.length > 0) {
      for (const entity of this._entitiesAdded) {
        entity.onInitialize();
      }
      this._entitiesAdded = [];
    }
    for (const entity of this._entities) {
      entity.onUpdate(delta);
    }
  }

  private _onAnimationFrame(delta: PIXI.Ticker) {
    for (const entity of this._entities) {
      entity.onAnimationFrame(delta);
    }
  }
}
