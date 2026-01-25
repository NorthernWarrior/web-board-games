import { Component } from '@angular/core';
import { SharedComponentsModule } from 'app/shared-components/shared-components.module';
import { RouterLink } from "@angular/router";

@Component({
  templateUrl: './monopoly.component.html',
  styleUrls: ['./monopoly.component.scss'],
  imports: [SharedComponentsModule, RouterLink],
})
export class MonopolyComponent {}
