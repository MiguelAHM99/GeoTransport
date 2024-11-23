import { Component, OnInit } from '@angular/core';
import { RutaI } from 'src/app/models/rutas.models';
import { FirestoreService } from 'src/app/services/firestore.service';
import { AlertController } from '@ionic/angular'; 
import { Router } from '@angular/router';
import { Firestore, collection, getDocs, doc, deleteDoc } from '@angular/fire/firestore';
import { SelectedServiceService } from 'src/app/services/selected-service.service';

@Component({
  selector: 'app-admin-rute',
  templateUrl: './admin-rute.page.html',
  styleUrls: ['./admin-rute.page.scss'],
})
export class AdminRutePage implements OnInit {
  rutas: RutaI[] = [];
  cargando: boolean = false;
  selectedServicio: string;
  newVehiculo: { nombre: string; patente: string } = { nombre: '', patente: '' };

  constructor(
    private readonly firestoreService: FirestoreService,
    private readonly alertController: AlertController,    
    private readonly router: Router,
    private readonly firestore: Firestore,
    private readonly selectedServiceService: SelectedServiceService
  ) {}

  ngOnInit() {
    const loggedUser = JSON.parse(localStorage.getItem('user') || 'null');
    if (loggedUser) {
      this.selectedServicio = loggedUser.selectedServicio;
      this.loadRutas();
    } else {
      // Redirigir al usuario a la página de login si no está autenticado
      this.router.navigate(['/login']);
    }
  }

  async loadRutas() {
    if (!this.selectedServicio) return;

    this.cargando = true;
    const rutasRef = collection(this.firestore, `Servicios/${this.selectedServicio}/rutas`);
    const querySnapshot = await getDocs(rutasRef);
    this.rutas = querySnapshot.docs.map(doc => {
      const data = doc.data() as RutaI;
      data.id = doc.id;
      return data;
    });
    this.cargando = false;
  }

  async edit(ruta: RutaI) {
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

  async delete(ruta: RutaI) {
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
            await deleteDoc(doc(this.firestore, `Servicios/${this.selectedServicio}/rutas/${ruta.id}`));
            this.cargando = false;
            this.loadRutas(); // Recargar la lista de rutas
          }
        }
      ]
    });
    await alert.present();
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}