import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminRutePage } from './admin-rute.page';

const routes: Routes = [
  {
    path: '',
    component: AdminRutePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRutePageRoutingModule {}
