import { Component, computed, inject, signal } from '@angular/core';
import { SharedComponentsModule } from 'app/shared-components/shared-components.module';
import { GameEngine, GameEngineCanvasComponent } from 'app/engine';
import { MazeEntity } from './entities/maze.entity';
import { MatFormField, MatLabel } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

@Component({
  templateUrl: './maze-generator.component.html',
  styleUrls: ['./maze-generator.component.scss'],
  imports: [
    SharedComponentsModule,
    GameEngineCanvasComponent,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormField,
    MatSelectModule,
    MatLabel,
  ],
})
export class MazeGeneratorComponent {
  private _mazeEntity: MazeEntity | null = null;
  public readonly formGenerate: FormGroup;
  public readonly formLayout: FormGroup;

  public readonly uimode = signal<'generate' | 'print-layout'>('generate');
  public readonly imageUrls = signal<string[]>([]);
  public readonly isGenerating = signal(false);

  public readonly imageUrlPairs = computed(() => {
    const urls = this.imageUrls();
    const pairs = [];
    for (let i = 0; i < urls.length; i += 2) {
      pairs.push(urls.slice(i, i + 2));
    }
    return pairs;
  });

  constructor() {
    const fb = inject(FormBuilder);
    this.formGenerate = fb.group({
      width: [30],
      height: [20],
    });
    this.formGenerate.valueChanges.subscribe((value) => {
      if (this._mazeEntity) {
        this._mazeEntity.width = value.width;
        this._mazeEntity.height = value.height;
      }
    });

    this.formLayout = fb.group({
      count: [2],
    });
    this.formLayout.valueChanges.subscribe((value) => {
      const diff = value.count - this.imageUrls().length;
      if (diff === 0) {
        return;
      }
      if (diff < 0) {
        this.imageUrls.update((urls) => urls.slice(0, value.count));
        return;
      }
      this._generateMazes(diff);
    });
  }

  onEngineInitialized(engine: GameEngine) {
    this._mazeEntity = new MazeEntity();
    engine.addEntity(this._mazeEntity);
  }

  onEnterPrintLayout() {
    this.uimode.set('print-layout');

    this._generateMazes(this.formLayout.value.count);
  }

  canPrint() {
    return this.formLayout.valid && !this.isGenerating();
  }
  onPrint() {
    window.print();

    // After printing, we want to reset the state, so that the user can generate new mazes and print again.
    this.imageUrls.set([]);
    this.uimode.set('generate');
  }

  private _generateMazes(count: number) {
    if (count === 0) {
      return;
    }
    this.isGenerating.set(true);
    let generatedCount = 0;
    if (count > 1) {
      const sub = this._mazeEntity?.mazeGenerated.subscribe(() => {
        if (generatedCount >= count - 1) {
          sub?.unsubscribe();
          this.isGenerating.set(false);
        }
        ++generatedCount;
        this._takeScreenshot();
      });
    } else {
      this.isGenerating.set(false);
    }
    ++generatedCount;
    this._takeScreenshot();
  }

  private async _takeScreenshot() {
    const app = this._mazeEntity?.app;
    if (!app) {
      return;
    }
    app.stop();

    const url = await app.renderer.extract.base64(this._mazeEntity?.container!);
    this.imageUrls.update((urls) => [...urls, url]);

    app.start();

    this._mazeEntity?.regenerate();
  }
}
