import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminEditDriverPage } from './admin-edit-driver.page';

const routes: Routes = [
  {
    path: '',
    component: AdminEditDriverPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminEditDriverPageRoutingModule {}
