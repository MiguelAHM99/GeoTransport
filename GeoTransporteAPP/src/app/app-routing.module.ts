import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './services/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
<<<<<<< Updated upstream
  {
    path: 'folder/:id',
    loadChildren: () => import('./folder/folder.module').then( m => m.FolderPageModule)
  },
=======
>>>>>>> Stashed changes
  {
    path: 'inicio',
    loadChildren: () => import('./pages/inicio/inicio.module').then(m => m.InicioPageModule)
  },
  {
    path: 'user-map',
    loadChildren: () => import('./pages/user-map/user-map.module').then(m => m.UserMapPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'driver-map',
    loadChildren: () => import('./pages/driver-map/driver-map.module').then(m => m.DriverMapPageModule)
  },
  {
    path: 'admin-driver',
    loadChildren: () => import('./pages/admin-driver/admin-driver.module').then(m => m.AdminDriverPageModule)
  },
  {
    path: 'admin-edit-driver',
    loadChildren: () => import('./pages/admin-edit-driver/admin-edit-driver.module').then(m => m.AdminEditDriverPageModule)
  },
  {
    path: 'admin-rute',
    loadChildren: () => import('./pages/admin-rute/admin-rute.module').then(m => m.AdminRutePageModule)
  },
  {
    path: 'admin-edit-rute',
    loadChildren: () => import('./pages/admin-edit-rute/admin-edit-rute.module').then(m => m.AdminEditRutePageModule)
  },
  {
    path: 'admin-edit-rute/:id',
    loadChildren: () => import('./pages/admin-edit-rute/admin-edit-rute.module').then(m => m.AdminEditRutePageModule)
  },
  {
    path: 'admin-vehicle',
    loadChildren: () => import('./pages/admin-vehicle/admin-vehicle.module').then(m => m.AdminVehiclePageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}