import { Routes } from '@angular/router';
import { MazeGeneratorComponent } from './maze-generator/maze-generator.component';

export const routes: Routes = [
  { path: '', redirectTo: "maze-generator", pathMatch: 'full' },
  { path: 'maze-generator', component: MazeGeneratorComponent },
];
