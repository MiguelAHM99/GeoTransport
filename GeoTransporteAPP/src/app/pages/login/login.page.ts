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
  selectedServicio: string;
  servicios: any[] = [];

  constructor(
    private readonly firestore: Firestore,
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly selectedServiceService: SelectedServiceService
  ) {}

  ngOnInit() {
    this.loadServicios();
  }

  // Cargar los servicios disponibles
  async loadServicios() {
    const serviciosRef = collection(this.firestore, 'Servicios');
    const querySnapshot = await getDocs(serviciosRef);
    this.servicios = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  // Función de login
  async login() {
    try {
      if (!this.selectedServicio) {
        alert('Por favor, seleccione un servicio.');
        return;
      }

      const usuariosRef = collection(this.firestore, `Servicios/${this.selectedServicio}/usuarios`);
      const q = query(usuariosRef, where('correo', '==', this.correo));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.error('Usuario no encontrado');
        alert('Usuario no encontrado');
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

      console.log('Usuario autenticado:', userData);

      // Almacenar el ID del usuario autenticado en AuthService
      await this.authService.setCurrentUserId(userDoc.id,this.selectedServicio);  // Esperar a que se complete
      this.authService.setCurrentUserEmail(this.correo);

      console.log('Email almacenado:', this.authService.getCurrentUserEmail());
      console.log('ID almacenado:', this.authService.getCurrentUserId());

      // Almacenar el servicio seleccionado
      this.selectedServiceService.setSelectedService(this.selectedServicio);

      // Depuración adicional
      console.log('Es socio?', this.authService.userIsSocio());
      console.log('Es conductor?', this.authService.userIsConductor());
      
      // Redirigir según el rol del usuario
      if (this.authService.userIsSocio()) {
        console.log("Redirigiendo a /admin-driver");
        await this.router.navigate(['/admin-driver']);
        console.log("Redirección a /admin-driver completada");
      } else if (this.authService.userIsConductor()) {
        console.log("Redirigiendo a /driver-map");
        await this.router.navigate(['/driver-map']);
        console.log("Redirección a /driver-map completada");
      } else {
        console.error("No se pudo determinar el rol del usuario");
        await this.router.navigate(['/login']);
      }
    } catch (error: any) { // Especifica el tipo del parámetro error
      console.error("Error durante la autenticación:", error);
    }
  }
}

