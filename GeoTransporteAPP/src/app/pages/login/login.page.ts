import { Component, OnInit } from '@angular/core';
import { Firestore, collection, query, where, getDocs } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { SelectedServiceService } from 'src/app/services/selected-service.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  correo: string;
  contrasenna: string;
  servicios: any[] = [];
  selectedServicio: string;

  constructor(
    private firestore: Firestore,
    private router: Router,
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

  async onLogin() {
    try {
      console.log('Iniciando sesión con:', this.correo, 'en el servicio:', this.selectedServicio);

      // Guardar el servicio seleccionado en el servicio compartido
      this.selectedServiceService.setSelectedService(this.selectedServicio);

      // Buscar el usuario en Firestore utilizando el correo y el servicio seleccionado
      const usersRef = collection(this.firestore, `Servicios/${this.selectedServicio}/usuarios`);
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

      console.log('Usuario autenticado:', userData);

      // Redirigir al usuario basado en su rol
      if (userData['socio']) {
        console.log('Usuario es socio, redirigiendo a /admin-driver');
        this.router.navigate(['/admin-driver']);
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