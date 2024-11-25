import { Component, OnInit } from '@angular/core';
import { Firestore, collection, getDocs, query, where } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { SelectedServiceService } from 'src/app/services/selected-service.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  correo: string;
  contrasenna: string;

  constructor(
    private readonly firestore: Firestore,
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly selectedServiceService: SelectedServiceService
  ) {}

  ngOnInit() {}

  async login() {
    try {
      // Obtener todos los servicios
      const serviciosSnapshot = await getDocs(collection(this.firestore, 'Servicios'));
      console.log('Servicios obtenidos:', serviciosSnapshot.docs.map(doc => doc.id));
      let userFound = false;
      let userData: any;
      let userDocId: string;
      let selectedServicio: string;

      for (const servicioDoc of serviciosSnapshot.docs) {
        const servicioId = servicioDoc.id;
        const usuariosRef = collection(this.firestore, `Servicios/${servicioId}/usuarios`);
        const q = query(usuariosRef, where('correo', '==', this.correo), where('contrasenna', '==', this.contrasenna));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          userFound = true;
          userDocId = querySnapshot.docs[0].id;
          userData = querySnapshot.docs[0].data();
          selectedServicio = servicioId;
          break;
        }
      }

      if (!userFound) {
        throw new Error('Usuario no encontrado o credenciales incorrectas.');
      }

      await this.authService.setCurrentUserId(userDocId, selectedServicio);
      this.authService.setCurrentUserEmail(this.correo);

      // Almacenar el servicio seleccionado en SelectedServiceService
      this.selectedServiceService.setSelectedService(selectedServicio);

      // Guardar la información del usuario en localStorage
      localStorage.setItem('user', JSON.stringify({ userData, userDocId, selectedServicio }));

      // Establecer la bandera de sesión iniciada recientemente
      this.authService.login();

      // Redirigir al usuario basado en su rol
      if (userData['socio']) {
        console.log('Usuario es socio, redirigiendo a /admin-panel');
        this.router.navigate(['/admin-panel']);
      } else {
        console.log('Usuario no es socio, redirigiendo a /driver-map');
        this.router.navigate(['/driver-map']);
      }
    } catch (error) {
      console.error('Error en el login:', error);
      alert('Error en el login: ' + (error as Error).message);
    }
  }
}