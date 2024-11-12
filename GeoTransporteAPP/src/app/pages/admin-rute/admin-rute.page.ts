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

  constructor(
    private readonly firestoreService: FirestoreService,
    private readonly alertController: AlertController,    
    private readonly router: Router,
    private readonly firestore: Firestore,
    private readonly selectedServiceService: SelectedServiceService
  ) { 
    this.initRutas();
  }

  ngOnInit() {
    this.selectedServicio = this.selectedServiceService.getSelectedService();
    this.loadRutas();
  }

  // Inicializar la lista de rutas
  initRutas() {
    this.rutas = [];
  }

  // Cargar la colección completa de rutas
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

  // Editar una ruta existente
  edit(ruta: RutaI) {
    this.router.navigate(['/admin-edit-rute', ruta.id]);
  }

  // Eliminar una ruta existente
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
            await deleteDoc(doc(this.firestore, `Servicios/${this.selectedServicio}/rutas`, ruta.id));
            this.cargando = false;
            this.loadRutas(); // Recargar la lista de rutas
          }
        }
      ]
    });
    await alert.present();
  }
}