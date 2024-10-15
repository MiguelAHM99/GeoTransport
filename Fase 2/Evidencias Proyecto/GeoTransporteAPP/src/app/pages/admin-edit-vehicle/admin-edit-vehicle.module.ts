import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AdminEditVehiclePageRoutingModule } from './admin-edit-vehicle-routing.module';

import { AdminEditVehiclePage } from './admin-edit-vehicle.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AdminEditVehiclePageRoutingModule
  ],
  declarations: [AdminEditVehiclePage]
})
export class AdminEditVehiclePageModule {}
