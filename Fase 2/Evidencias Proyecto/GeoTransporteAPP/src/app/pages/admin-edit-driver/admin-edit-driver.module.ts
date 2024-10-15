import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AdminEditDriverPageRoutingModule } from './admin-edit-driver-routing.module';

import { AdminEditDriverPage } from './admin-edit-driver.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AdminEditDriverPageRoutingModule
  ],
  declarations: [AdminEditDriverPage]
})
export class AdminEditDriverPageModule {}
