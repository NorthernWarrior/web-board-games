import { AfterViewInit, Component, inject, input, output, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { GameEngine } from '../core/engine';

@Component({
  selector: 'app-game-engine-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss'],
})
export class GameEngineCanvasComponent implements AfterViewInit {
  private readonly platformId = inject(PLATFORM_ID);
  private _engine: GameEngine | null = null;

  public readonly clearColor = input<number>(0x3c3c3c);
  public readonly engineInitialized = output<GameEngine>();

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this._engine = new GameEngine(this.clearColor());
    this.engineInitialized.emit(this._engine);
  }
  
}
