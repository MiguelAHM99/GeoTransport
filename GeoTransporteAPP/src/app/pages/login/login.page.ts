// src/app/pages/login/login.page.ts

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Firestore, collection, query, where, getDocs } from '@angular/fire/firestore';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  correo: string;
  contrasenna: string;

  constructor(
    private firestore: Firestore,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {}

  async onLogin() {
    try {
      console.log('Iniciando sesión con:', this.correo);

      // Buscar el usuario en Firestore utilizando el correo
      const usersRef = collection(this.firestore, 'usuarios');
      const q = query(usersRef, where('correo', '==', this.correo));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.error('No se encontró el usuario con el correo proporcionado');
        alert('No se encontró el usuario con el correo proporcionado');
        return;
      }

      // Obtener el documento del usuario
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();

      // Verificar la contraseña
      if (userData['contrasenna'] !== this.contrasenna) {
        console.error('Contraseña incorrecta');
        alert('Contraseña incorrecta');
        return;
      }

      // Iniciar sesión con el servicio de autenticación
      await this.authService.login(this.correo, this.contrasenna);

      console.log('Usuario autenticado:', userData);

      // Redirigir según el rol del usuario
      if (userData['socio']) {
        this.router.navigate(['/admin-driver']);
      } else {
        this.router.navigate(['/driver-map']);
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      alert('Error al iniciar sesión');
    }
  }
}