// auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; // Asegúrate de que la ruta sea correcta
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.authService.isAuthenticated().pipe(
      map(isAuthenticated => !isAuthenticated), // Cambia a false si está logueado
      tap(isAllowed => {
        if (!isAllowed) {
          // Redirige si ya está logueado
          this.router.navigate(['/home']); // Cambia "/home" por la página de destino deseada
        }
      })
    );
  }
}
