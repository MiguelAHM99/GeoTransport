import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FirestoreService } from './firestore.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserId: string;
  private currentUserEmail: string;
  private isSocio: boolean | undefined;
  private loggedIn = new BehaviorSubject<boolean>(false);
  private sessionStartedRecentlySubject = new BehaviorSubject<boolean>(false); // Renombrado para evitar duplicación
  private sessionFromLocalStorage = new BehaviorSubject<boolean>(false);

  constructor(
    private readonly firestoreService: FirestoreService
  ) {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user) {
      this.currentUserId = user.userDocId;
      this.currentUserEmail = user.userData.correo;
      this.isSocio = user.userData.socio;
      this.loggedIn.next(true);
      this.sessionStartedRecentlySubject.next(false);
      this.sessionFromLocalStorage.next(true);
    } else {
      this.loggedIn.next(false);
    }
  }

  isAuthenticated(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  sessionStartedRecently(): Observable<boolean> {
    return this.sessionStartedRecentlySubject.asObservable();
  }

  isSessionFromLocalStorage(): Observable<boolean> {
    return this.sessionFromLocalStorage.asObservable();
  }

  login() {
    this.loggedIn.next(true);
    this.sessionStartedRecentlySubject.next(true);
    this.sessionFromLocalStorage.next(false);
  }

  logout() {
    this.loggedIn.next(false);
    this.sessionStartedRecentlySubject.next(false);
    this.sessionFromLocalStorage.next(false);
    localStorage.removeItem('user');
  }

  setSessionFromLocalStorage() {
    this.sessionFromLocalStorage.next(true);
  }

  // Método asincrónico para establecer el ID y obtener los datos del usuario
  async setCurrentUserId(userId: string, servicioId: string): Promise<void> {
    this.currentUserId = userId;
    try {
      // Accede al documento del usuario en la subcolección 'usuarios' dentro de 'Servicios/{servicioId}/usuarios'
      const userDoc = await this.firestoreService.getDocument<any>(`Servicios/${servicioId}/usuarios`, userId);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        // Verifica si el campo 'socio' existe y establece el valor de isSocio
        if (userData && userData.hasOwnProperty('socio')) {
          this.isSocio = userData.socio;
          console.log("Rol del usuario (socio):", this.isSocio);
          this.sessionStartedRecentlySubject.next(true); // Establecer la bandera cuando se obtienen los datos del usuario
        } else {
          console.error("El campo 'socio' no está definido en el documento del usuario");
        }
      } else {
        console.error("Usuario no encontrado en Firestore");
      }
    } catch (error) {
      console.error("Error al obtener el documento del usuario:", error);
    }
  }

  getCurrentUserId(): string {
    return this.currentUserId;
  }

  setCurrentUserEmail(email: string): void {
    this.currentUserEmail = email;
  }

  getCurrentUserEmail(): string {
    return this.currentUserEmail;
  }

  // Método para verificar si el usuario es socio
  userIsSocio(): boolean {
    if (this.isSocio === undefined) {
      throw new Error("El rol del usuario no está definido");
    }
    return this.isSocio;
  }

  // Método para verificar si el usuario es conductor
  userIsConductor(): boolean {
    return this.isSocio === false;
  }
}