import { NgModule } from '@angular/core';
import { ButtonTileComponent, ButtonTilesGridComponent } from '.';

@NgModule({
  imports: [ButtonTileComponent, ButtonTilesGridComponent],
  exports: [ButtonTileComponent, ButtonTilesGridComponent],
})
export class ButtonTilesModule {}