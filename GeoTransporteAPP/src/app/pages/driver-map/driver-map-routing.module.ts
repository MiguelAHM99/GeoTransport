import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DriverMapPage } from './driver-map.page';

const routes: Routes = [
  {
    path: '',
    component: DriverMapPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DriverMapPageRoutingModule {}
