import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminVehiclePage } from './admin-vehicle.page';

const routes: Routes = [
  {
    path: '',
    component: AdminVehiclePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminVehiclePageRoutingModule {}
