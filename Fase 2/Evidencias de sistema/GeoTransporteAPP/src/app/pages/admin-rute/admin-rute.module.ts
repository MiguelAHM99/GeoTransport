import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AdminRutePageRoutingModule } from './admin-rute-routing.module';

import { AdminRutePage } from './admin-rute.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AdminRutePageRoutingModule
  ],
  declarations: [AdminRutePage]
})
export class AdminRutePageModule {}
