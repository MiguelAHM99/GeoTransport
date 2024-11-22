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
    //this.authService.observeUserState();
    this.firestorePersistence.enablePersistence();
    this.router.events.pipe(
      filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.showSidebar = event.url.startsWith('/admin-');
    });
  }

  ngOnInit() {
    const loggedUser = JSON.parse(localStorage.getItem('loggedUser') || 'null');
    if (loggedUser) {
      console.log('Usuario encontrado en localStorage:', loggedUser);
      this.authService.setCurrentUserId(loggedUser.userId, loggedUser.servicio);
      this.authService.setCurrentUserEmail(loggedUser.email);

      // Redirigir al usuario basado en su rol
      if (loggedUser.role === 'socio') {
        this.router.navigate(['/admin-panel']);
      }
    }
   }

  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
  }
  closeMenu() {
    const menu = document.querySelector('ion-menu');
    if (menu) {
      menu.close();
    }
  }
  
}