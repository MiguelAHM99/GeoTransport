import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminEditRutePage } from './admin-edit-rute.page';

const routes: Routes = [
  {
    path: '',
    component: AdminEditRutePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminEditRutePageRoutingModule {}
