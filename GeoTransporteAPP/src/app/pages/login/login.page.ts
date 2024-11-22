
import { Component, OnInit } from '@angular/core';
import { Firestore, collection, query, where, getDocs } from '@angular/fire/firestore';
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

      // Iterar sobre cada servicio y buscar al usuario
      for (const servicioDoc of serviciosSnapshot.docs) {
        const servicioId = servicioDoc.id;
        console.log(`Buscando en servicio: ${servicioId}`);
        const usuariosSnapshot = await getDocs(query(
          collection(this.firestore, `Servicios/${servicioId}/usuarios`),
          where('correo', '==', this.correo)
        ));
        console.log(`Usuarios encontrados en ${servicioId}:`, usuariosSnapshot.docs.map(doc => doc.id));

        if (!usuariosSnapshot.empty) {
          const userDoc = usuariosSnapshot.docs[0];
          userData = userDoc.data();
          userDocId = userDoc.id;
          userFound = true;
          selectedServicio = servicioId; // Almacenar el servicio encontrado
          break;
        }
      }

      if (!userFound) {
        console.error('Usuario no encontrado');
        alert('Usuario no encontrado');
        return;
      }

      // Verificar la contraseña
      if (userData['contrasenna'] !== this.contrasenna) {
        console.error('Contraseña incorrecta');
        alert('Contraseña incorrecta');
        return;
      }

      console.log('Usuario autenticado:', userData);

      // Almacenar el ID del usuario autenticado en AuthService
      this.authService.setCurrentUserId(userDocId, selectedServicio);
      this.authService.setCurrentUserEmail(this.correo);

      // Almacenar el servicio seleccionado en SelectedServiceService
      this.selectedServiceService.setSelectedService(selectedServicio);

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
