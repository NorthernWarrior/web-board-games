import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-button-tile',
  templateUrl: './button-tile.component.html',
  styleUrls: ['./button-tile.component.scss'],
  host: {
    class: 'app-button-tile',
  },
  imports: [RouterLink],
  standalone: true,
})
export class ButtonTileComponent {
  readonly iconSrc = input<string>('/images/game-tile-default.svg');
  readonly label = input<string>('');
  readonly description = input<string>('');
  readonly routerLink = input<string | undefined>(undefined);
}
