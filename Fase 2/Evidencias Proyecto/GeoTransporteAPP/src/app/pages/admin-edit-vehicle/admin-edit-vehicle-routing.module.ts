import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminEditVehiclePage } from './admin-edit-vehicle.page';

const routes: Routes = [
  {
    path: '',
    component: AdminEditVehiclePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminEditVehiclePageRoutingModule {}
