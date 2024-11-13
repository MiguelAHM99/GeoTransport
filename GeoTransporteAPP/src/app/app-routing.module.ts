import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { SocioGuard } from 'src/app/guards/socio.guard';

const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
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
    loadChildren: () => import('./pages/driver-map/driver-map.module').then(m => m.DriverMapPageModule),
    canActivate: [SocioGuard]  // Aplica el guard en esta ruta
  },
  
  {
    path: 'admin-driver',
    loadChildren: () => import('./pages/admin-driver/admin-driver.module').then(m => m.AdminDriverPageModule),
    canActivate: [SocioGuard]  // Aplica el guard en esta ruta
  },
  {
    path: 'admin-edit-driver',
    loadChildren: () => import('./pages/admin-edit-driver/admin-edit-driver.module').then(m => m.AdminEditDriverPageModule),
    canActivate: [SocioGuard]  // Aplica el guard en esta ruta
  },
  {
    path: 'admin-edit-driver/:id',
    loadChildren: () => import('./pages/admin-edit-driver/admin-edit-driver.module').then(m => m.AdminEditDriverPageModule),
    canActivate: [SocioGuard]  // Aplica el guard en esta ruta
  },
  {
    path: 'admin-rute',
    loadChildren: () => import('./pages/admin-rute/admin-rute.module').then(m => m.AdminRutePageModule),
    canActivate: [SocioGuard]  // Aplica el guard en esta ruta
  },
  {
    path: 'admin-edit-rute',
    loadChildren: () => import('./pages/admin-edit-rute/admin-edit-rute.module').then(m => m.AdminEditRutePageModule),
    canActivate: [SocioGuard]  // Aplica el guard en esta ruta
  },
  {
    path: 'admin-edit-rute/:id',
    loadChildren: () => import('./pages/admin-edit-rute/admin-edit-rute.module').then(m => m.AdminEditRutePageModule),
    canActivate: [SocioGuard]  // Aplica el guard en esta ruta
  },
  {
    path: 'admin-vehicle',
    loadChildren: () => import('./pages/admin-vehicle/admin-vehicle.module').then(m => m.AdminVehiclePageModule),
    canActivate: [SocioGuard]  // Aplica el guard en esta ruta
  },
  {
    path: 'admin-edit-vehicle',
    loadChildren: () => import('./pages/admin-edit-vehicle/admin-edit-vehicle.module').then(m => m.AdminEditVehiclePageModule),
    canActivate: [SocioGuard]  // Aplica el guard en esta ruta
  },
  {
    path: 'admin-edit-vehicle/:id',
    loadChildren: () => import('./pages/admin-edit-vehicle/admin-edit-vehicle.module').then(m => m.AdminEditVehiclePageModule),
    canActivate: [SocioGuard]  // Aplica el guard en esta ruta
  },
  {
    path: 'admin-panel',
    loadChildren: () => import('./pages/admin-panel/admin-panel.module').then( m => m.AdminPanelPageModule),
    canActivate: [SocioGuard]  // Aplica el guard en esta ruta
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule { }