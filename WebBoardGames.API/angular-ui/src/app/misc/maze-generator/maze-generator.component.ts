import { Component } from "@angular/core";
import { SharedComponentsModule } from "app/shared-components/shared-components.module";
import { GameEngine, GameEngineCanvasComponent } from "app/engine";
import { MazeEntity } from "./entities/maze.entity";

@Component({
  templateUrl: './maze-generator.component.html',
  styleUrls: ['./maze-generator.component.scss'],
  imports: [SharedComponentsModule, GameEngineCanvasComponent],
})
export class MazeGeneratorComponent {

    onEngineInitialized(engine: GameEngine) {
        engine.addEntity(new MazeEntity());
    }
    
}