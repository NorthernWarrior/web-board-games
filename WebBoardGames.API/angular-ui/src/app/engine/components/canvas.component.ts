import { AfterViewInit, Component, effect, ElementRef, inject, input, output, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { GameEngine } from '../core/engine';

@Component({
  selector: 'app-game-engine-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss'],
})
export class GameEngineCanvasComponent implements AfterViewInit {
  private static _initialised = false;
  private readonly platformId = inject(PLATFORM_ID);
  private _engine: GameEngine | null = null;

  public readonly clearColor = input<number>(0x3c3c3c);
  public readonly engineInitialized = output<GameEngine>();
  public readonly hasDefaultMovement = input<boolean>(false);

  public readonly canvasWidth = input(0);
  public readonly canvasHeight = input(0);

  constructor(){
    effect(()=>{
      const w = this.canvasWidth();
      const h = this.canvasHeight();

      if (this._engine) {
        this._engine.resize(w, h);
      }
    });
  }

  ngAfterViewInit(): void {
    // TODO: Hacky workaround, if this would not be here, the canvas would be created twice
    // But this also means, I can't navigate to another Component that create this Engine, without reloading the page.
    if (GameEngineCanvasComponent._initialised) {
      return;
    }
    GameEngineCanvasComponent._initialised = true;

    if (!isPlatformBrowser(this.platformId) || !!this._engine) {
      return;
    }

    this._engine = new GameEngine(this.clearColor(), this.canvasWidth(), this.canvasHeight());
    if (this.hasDefaultMovement()) {
      this._engine.enableDefaultMovement();
    }
    this.engineInitialized.emit(this._engine);
  }
}
