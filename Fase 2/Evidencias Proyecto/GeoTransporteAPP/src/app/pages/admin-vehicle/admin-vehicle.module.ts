import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AdminVehiclePageRoutingModule } from './admin-vehicle-routing.module';

import { AdminVehiclePage } from './admin-vehicle.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AdminVehiclePageRoutingModule
  ],
  declarations: [AdminVehiclePage]
})
export class AdminVehiclePageModule {}
