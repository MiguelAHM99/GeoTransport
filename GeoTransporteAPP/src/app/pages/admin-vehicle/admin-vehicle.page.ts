import { Component, OnInit } from '@angular/core';
import { VehiculoI } from 'src/app/common/models/vehiculos.models';
import { FirestoreService } from 'src/app/common/services/firestore.service';
import { AlertController } from '@ionic/angular'; 
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-vehicle',
  templateUrl: './admin-vehicle.page.html',
  styleUrls: ['./admin-vehicle.page.scss'],
})
export class AdminVehiclePage implements OnInit {

  vehiculos: VehiculoI[] = [];
  cargando: boolean = false;

  constructor(
    private firestoreService: FirestoreService,
    private alertController: AlertController ,    
    private router: Router

  ) {
    this.loadvehiculos();
  }

  ngOnInit() { }

 // Cargar la colección completa de vehículos
 loadvehiculos() {
  this.firestoreService.getCollectionChanges<VehiculoI>('Vehiculos').subscribe(data => {
    this.vehiculos = data;
  });
}

// Mostrar un alert de error
async showAlert(header: string, message: string) {
  const alert = await this.alertController.create({
    header,
    message,
    buttons: ['OK']
  });
  await alert.present();
}

async edit(vehiculo: VehiculoI) {
  const alert = await this.alertController.create({
    header: 'Confirmar',
    message: `¿Estás seguro de que deseas editar el vehículo: ${vehiculo.nombre}?`,
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel',
      },
      {
        text: 'Confirmar',
        handler: () => {
          // Nada en el handler, solo cerramos el alert
        }
      }
    ]
  });

  await alert.present();

  // Esperamos a que el alert se cierre
  const { role } = await alert.onDidDismiss();

  // Si el usuario confirma la edición, navegamos a la página de edición
  if (role !== 'cancel') {
    this.router.navigate(['/admin-edit-vehicle', vehiculo.id]);
  }
}

// Eliminar un vehículo existente
async delete(vehiculo: VehiculoI) {
  const alert = await this.alertController.create({
    header: 'Confirmar',
    message: `¿Estás seguro de que deseas eliminar el vehículo: ${vehiculo.nombre}?`,
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel',
      },
      {
        text: 'Confirmar',
        handler: async () => {
          this.cargando = true;
          await this.firestoreService.deleteDocument('Vehiculos', vehiculo.id);
          this.cargando = false;
        }
      }
    ]
  });
  await alert.present();
}

}
