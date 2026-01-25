import { Component, contentChildren, TemplateRef, ElementRef, AfterViewInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonTileComponent } from '../button-tile/button-tile.component';

@Component({
  selector: 'app-button-tiles-grid',
  imports: [CommonModule],
  templateUrl: './button-tiles-grid.component.html',
  styleUrls: ['./button-tiles-grid.component.scss'],
  host: {
    class: 'app-button-tiles-grid',
  },
  standalone: true
})
export class ButtonTilesGridComponent {
  tiles = contentChildren(ButtonTileComponent);

  constructor(private el: ElementRef<HTMLElement>){
    effect(() => {
      const count = Math.min(this.tiles().length, 3);
      this.el.nativeElement.style.setProperty('--tile-cols', count.toString());
    });
  }
}
