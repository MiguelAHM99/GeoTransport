import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AdminDriverPageRoutingModule } from './admin-driver-routing.module';

import { AdminDriverPage } from './admin-driver.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AdminDriverPageRoutingModule
  ],
  declarations: [AdminDriverPage]
})
export class AdminDriverPageModule {}
