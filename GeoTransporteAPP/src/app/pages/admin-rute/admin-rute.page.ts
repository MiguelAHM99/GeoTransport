import { Component, OnInit } from '@angular/core';
import { RutaI } from 'src/app/models/rutas.models';
import { FirestoreService } from 'src/app/services/firestore.service';
import { AlertController } from '@ionic/angular';
import { Firestore, collection, getDocs, doc, deleteDoc, query, where } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { SelectedServiceService } from 'src/app/services/selected-service.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-admin-rute',
  templateUrl: './admin-rute.page.html',
  styleUrls: ['./admin-rute.page.scss'],
})
export class AdminRutePage implements OnInit {

  rutas: RutaI[] = [];
  cargando: boolean = false;
  selectedServicio: string;
  sessionStartedRecently: boolean = false;
  isSessionFromLocalStorage: boolean = false;

  constructor(
    private readonly firestoreService: FirestoreService,
    private readonly alertController: AlertController,
    private readonly firestore: Firestore,
    private readonly router: Router,
    private readonly selectedServiceService: SelectedServiceService,
    private readonly authService: AuthService
  ) { }

  ngOnInit() {
    this.authService.sessionStartedRecently().subscribe(recentlyStarted => {
      this.sessionStartedRecently = recentlyStarted;
    });

    this.authService.isSessionFromLocalStorage().subscribe(fromLocalStorage => {
      this.isSessionFromLocalStorage = fromLocalStorage;
    });

    const loggedUser = JSON.parse(localStorage.getItem('user') || 'null');
    if (loggedUser) {
      this.selectedServicio = loggedUser.selectedServicio;
      console.log('Usuario autenticado, servicio seleccionado:', this.selectedServicio);
      this.loadRutas();
    } else {
      // Redirigir al usuario a la página de login si no está autenticado
      console.log('Usuario no autenticado, redirigiendo a login');
      this.router.navigate(['/login']);
    }
  }

  // Cargar la colección completa de rutas
  async loadRutas() {
    if (!this.selectedServicio) return;

    this.cargando = true;
    console.log('Cargando rutas para el servicio:', this.selectedServicio);
    const rutasRef = collection(this.firestore, `Servicios/${this.selectedServicio}/rutas`);
    const querySnapshot = await getDocs(rutasRef);
    this.rutas = querySnapshot.docs.map(doc => {
      const data = doc.data() as RutaI;
      data.id = doc.id;
      return data;
    });
    console.log('Rutas cargadas:', this.rutas);
    this.cargando = false;
  }

  // Editar una ruta existente
  async edit(ruta: RutaI) {
    if (this.isSessionFromLocalStorage) {
      this.showAlertAndRedirect('Sesión expirada', 'Debes iniciar sesión nuevamente para editar una ruta.');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: `¿Estás seguro de que deseas editar la ruta: ${ruta.nombre}?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Confirmar', handler: () => {} }
      ]
    });

    await alert.present();
    const { role } = await alert.onDidDismiss();

    // Si el usuario confirma la edición, navegamos a la página de edición
    if (role !== 'cancel') {
      this.router.navigate(['/admin-edit-rute', ruta.id]);
    }
  }

  // Eliminar una ruta existente
  async delete(ruta: RutaI) {
    if (this.isSessionFromLocalStorage) {
      this.showAlertAndRedirect('Sesión expirada', 'Debes iniciar sesión nuevamente para eliminar una ruta.');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: `¿Estás seguro de que deseas eliminar la ruta: ${ruta.nombre}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Confirmar',
          handler: async () => {
            this.cargando = true;
            console.log('Eliminando ruta:', ruta.id);
            try {
              await deleteDoc(doc(this.firestore, `Servicios/${this.selectedServicio}/rutas/${ruta.id}`));
              console.log('Ruta eliminada:', ruta.id);
              this.loadRutas(); // Recargar la lista de rutas
            } catch (error) {
              console.error('Error al eliminar la ruta:', error);
            } finally {
              this.cargando = false;
            }
          }
        }
      ]
    });
    await alert.present();
  }

  create() {
    if (this.isSessionFromLocalStorage) {
      this.showAlertAndRedirect('Sesión expirada', 'Debes iniciar sesión nuevamente para crear una nueva ruta.');
      return;
    }

    console.log('Navegando a la creación de una nueva ruta');
    this.router.navigate(['/admin-edit-rute']);
  }

  // Mostrar un alert de error o éxito y redirigir al login
  async showAlertAndRedirect(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
    await alert.onDidDismiss();
    this.router.navigate(['/login']);
  }
}