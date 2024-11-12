import { Component, OnInit } from '@angular/core';
import { VehiculoI } from 'src/app/common/models/vehiculos.models';
import { FirestoreService } from 'src/app/common/services/firestore.service';
import { AlertController } from '@ionic/angular';
import { Firestore, collection, query, where, getDocs, doc, getDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { SelectedServiceService } from 'src/app/services/selected-service.service';

@Component({
  selector: 'app-admin-vehicle',
  templateUrl: './admin-vehicle.page.html',
  styleUrls: ['./admin-vehicle.page.scss'],
})
export class AdminVehiclePage implements OnInit {

  vehiculos: VehiculoI[] = [];
  newVehiculo: VehiculoI;
  cargando: boolean = false;
  vehiculo: VehiculoI;
  selectedServicio: string;

  constructor(
    private firestoreService: FirestoreService,
    private alertController: AlertController,
    private firestore: Firestore,
    private router: Router,
    private selectedServiceService: SelectedServiceService
  ) {
    this.initVehiculo();
  }

  ngOnInit() {
    this.selectedServicio = this.selectedServiceService.getSelectedService();
    this.loadVehiculos();
  }

  // Cargar la colección completa de vehículos
  async loadVehiculos() {
    if (!this.selectedServicio) return;

    const vehiculosRef = collection(this.firestore, `Servicios/${this.selectedServicio}/vehiculos`);
    const querySnapshot = await getDocs(vehiculosRef);
    this.vehiculos = querySnapshot.docs.map(doc => {
      const data = doc.data() as VehiculoI;
      data.id = doc.id;
      return data;
    });
  }

  // Inicializar un nuevo vehículo con ID único
  initVehiculo() {
    this.newVehiculo = {
      nombre: '',
      patente: '',
      id: this.firestoreService.createIdDoc()
    };
  }

  // Validar campos antes de guardar o editar
  validateInputs(): boolean {
    if (!this.newVehiculo.nombre || !this.newVehiculo.patente) {
      this.showAlert('Error', 'Por favor completa todos los campos');
      return false;
    }
    return true;
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

  // Guardar el nuevo vehículo en Firestore
  async save() {
    if (!this.validateInputs()) return; // Si la validación falla, detener el guardado.
    this.cargando = true;
    await this.firestoreService.createDocument(this.newVehiculo, `Servicios/${this.selectedServicio}/vehiculos`, this.newVehiculo.id);
    this.cargando = false;

    this.initVehiculo(); // Reiniciar el vehículo para los campos de entrada
    this.loadVehiculos(); // Recargar la lista de vehículos
  }

  // Editar un vehículo existente
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
            await this.firestoreService.deleteDocument(`Servicios/${this.selectedServicio}/vehiculos`, vehiculo.id);
            this.cargando = false;
            this.loadVehiculos(); // Recargar la lista de vehículos
          }
        }
      ]
    });
    await alert.present();
  }
}