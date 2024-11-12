import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AdminEditRutePageRoutingModule } from './admin-edit-rute-routing.module';

import { AdminEditRutePage } from './admin-edit-rute.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AdminEditRutePageRoutingModule
  ],
  declarations: [AdminEditRutePage]
})
export class AdminEditRutePageModule {}
