import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, Event } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { UsuarioI } from 'src/app/common/models/usuario.model';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  showSidebar: boolean = false;
  currentUser: User | null = null;
  socioId: string | null = null;

  constructor(private router: Router, private auth: Auth, private firestore: Firestore) {
    this.router.events.pipe(
      filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.showSidebar = event.url.startsWith('/admin-');
    });

    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        this.currentUser = user;
        const userDocRef = doc(this.firestore, `usuarios/${user.uid}`);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data() as UsuarioI;
          if (userData.socio) {
            this.socioId = user.uid;
          } else {
            this.socioId = null;
          }
        } else {
          this.socioId = null;
        }
      } else {
        this.currentUser = null;
        this.socioId = null;
      }
    });
  }

  ngOnInit() { }

  closeMenu() {
    const menu = document.querySelector('ion-menu');
    if (menu) {
      menu.close();
    }
  }
}