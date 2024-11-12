import { Component, OnInit } from '@angular/core';
import { RutaI } from 'src/app/common/models/rutas.models';
import { FirestoreService } from 'src/app/common/services/firestore.service';
import { AlertController } from '@ionic/angular'; 
import { Router } from '@angular/router';
@Component({
  selector: 'app-admin-rute',
  templateUrl: './admin-rute.page.html',
  styleUrls: ['./admin-rute.page.scss'],
})
export class AdminRutePage implements OnInit {

  rutas: RutaI[] = [];
  cargando: boolean = false;

  constructor(
    private firestoreService: FirestoreService,
    private alertController: AlertController,    
    private router: Router
  ) { 
    this.loadRutas();
  }

  ngOnInit() {
  }



  // Cargar la colección completa de rutas
  loadRutas() {
    this.firestoreService.getCollectionChanges<RutaI>('Rutas').subscribe(data => {
      this.rutas = data;
    });
  }

  // Editar una ruta existente
  async edit(ruta: RutaI) {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: `¿Estás seguro de que deseas editar la ruta: ${ruta.nombre}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Confirmar',
          handler: () => {
            this.router.navigate(['/admin-edit-rute', ruta.id]);
          }
        }
      ]
    });
    await alert.present();
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
            await this.firestoreService.deleteDocument('Rutas', ruta.id);
            this.cargando = false;
          }
        }
      ]
    });
    await alert.present();
  }
}
