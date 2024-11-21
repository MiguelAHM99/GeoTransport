import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class SocioGuard implements CanActivate {

  constructor(private readonly authService: AuthService, 
              private readonly router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
      if (this.authService.userIsSocio()) {
        return true;  // Permite la navegación
      }else if (this.authService.userIsConductor()) {
          return true;  // Permite la navegación
      } else {
        // Si no es socio, redirige a otra página, por ejemplo, al login
        this.router.navigate(['/login']);
        return false;  // Bloquea la navegación
      }
  }
}
