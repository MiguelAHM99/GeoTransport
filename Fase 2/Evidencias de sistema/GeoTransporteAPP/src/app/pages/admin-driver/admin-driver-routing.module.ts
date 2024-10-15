import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminDriverPage } from './admin-driver.page';

const routes: Routes = [
  {
    path: '',
    component: AdminDriverPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminDriverPageRoutingModule {}
