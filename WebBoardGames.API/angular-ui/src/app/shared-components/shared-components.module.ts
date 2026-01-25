import { NgModule } from '@angular/core';
import { DigitsDisplayComponent } from './digits-display/digits-display.component';
import { ButtonTilesModule } from './button-tiles';

@NgModule({
  imports: [DigitsDisplayComponent, ButtonTilesModule],
  exports: [DigitsDisplayComponent, ButtonTilesModule],
})
export class SharedComponentsModule {}
