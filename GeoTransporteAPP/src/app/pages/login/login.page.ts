// src/app/pages/login/login.page.ts

import { Component } from '@angular/core';
import { Router } from '@angular/router';
<<<<<<< Updated upstream
import { Firestore, collection, query, where, getDocs } from '@angular/fire/firestore';
import { AuthService } from '../../services/auth.service';
=======
import { SelectedServiceService } from 'src/app/services/selected-service.service';
>>>>>>> Stashed changes

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  correo: string;
  contrasenna: string;
  servicios: any[] = [];
  selectedServicio: string;

  constructor(
    private firestore: Firestore,
    private router: Router,
<<<<<<< Updated upstream
    private authService: AuthService
  ) {}

  ngOnInit() {}
=======
    private selectedServiceService: SelectedServiceService
  ) { }

  ngOnInit() {
    this.loadServicios();
  }

  async loadServicios() {
    const serviciosRef = collection(this.firestore, 'Servicios');
    const querySnapshot = await getDocs(serviciosRef);
    this.servicios = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
>>>>>>> Stashed changes

  async onLogin() {
    try {
      console.log('Iniciando sesión con:', this.correo, 'en el servicio:', this.selectedServicio);

      // Guardar el servicio seleccionado en el servicio compartido
      this.selectedServiceService.setSelectedService(this.selectedServicio);

      // Buscar el usuario en Firestore utilizando el correo y el servicio seleccionado
      const usersRef = collection(this.firestore, `Servicios/${this.selectedServicio}/Usuarios`);
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

<<<<<<< Updated upstream
      // Redirigir según el rol del usuario
=======
      // Redirigir al usuario basado en su rol
>>>>>>> Stashed changes
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