import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, Event } from '@angular/router';
import { filter } from 'rxjs/operators';
import { FirestorePersistenceService } from './services/firestore-persistence.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  showSidebar: boolean = false;
  isModalOpen = false;

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly firestorePersistence: FirestorePersistenceService
  ) 
  {
    this.firestorePersistence.enablePersistence();
    this.router.events.pipe(
      filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.showSidebar = event.url.startsWith('/admin-');
    });
  }

  ngOnInit() {
    const loggedUser = JSON.parse(localStorage.getItem('user') || 'null');
    if (loggedUser) {
      console.log('Usuario encontrado en localStorage:', loggedUser);
      this.authService.setCurrentUserId(loggedUser.userDocId, loggedUser.selectedServicio);
      this.authService.setCurrentUserEmail(loggedUser.userData.correo);
      this.authService.setSessionFromLocalStorage(); // Establecer que la sesión se cargó desde el localStorage
    } else {
      // Redirigir al usuario a la página de login si no está autenticado
      this.router.navigate(['/inicio']);
    }
  }

  closeMenu() {
    const menu = document.querySelector('ion-menu');
    if (menu) {
      menu.close();
    }
  }

  logoutAndGoHome() {
    // Eliminar el usuario de localStorage
    localStorage.removeItem('user');
    // Redirigir al usuario a la página de inicio
    this.router.navigate(['/inicio']);
  }

  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
  }
}