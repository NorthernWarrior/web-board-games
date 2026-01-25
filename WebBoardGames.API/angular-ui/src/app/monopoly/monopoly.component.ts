import { Component } from '@angular/core';
import { SharedComponentsModule } from 'app/shared-components/shared-components.module';

@Component({
  templateUrl: './monopoly.component.html',
  styleUrls: ['./monopoly.component.scss'],
  imports: [SharedComponentsModule],
})
export class MonopolyComponent {}
