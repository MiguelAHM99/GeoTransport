import { Injectable } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserId: string;
  private currentUserEmail: string;
  private isSocio: boolean | undefined; // Usamos undefined para manejar posibles valores no definidos
  private loggedIn = new BehaviorSubject<boolean>(false); // Valor inicial, modifícalo según el estado real de autenticación

  constructor(
    private readonly firestoreService: FirestoreService) 
  {
     // Puedes inicializar el estado real aquí, por ejemplo, leyendo un token de almacenamiento local
     const token = localStorage.getItem('token'); // Ejemplo
     this.loggedIn.next(!!token);
  }

  // Devuelve el estado de autenticación como Observable
  isAuthenticated(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  // Métodos para cambiar el estado de autenticación
  login() {
    this.loggedIn.next(true);
  }

  logout() {
    this.loggedIn.next(false);
    localStorage.removeItem('token'); // Ejemplo de limpieza de token
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
      console.error("El rol del usuario no está definido aún");
      return false; // O puedes devolver null o lanzar un error dependiendo de tu lógica
    }
    return this.isSocio === true;
  }

  // Método para verificar si el usuario es conductor
  userIsConductor(): boolean {
    if (this.isSocio === undefined) {
      console.error("El rol del usuario no está definido aún");
      return false; // O puedes devolver null o lanzar un error dependiendo de tu lógica
    }
    return this.isSocio === false;
  }
}