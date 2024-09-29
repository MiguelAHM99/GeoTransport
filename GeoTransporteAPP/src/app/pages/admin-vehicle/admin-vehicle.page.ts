import { Component, OnInit } from '@angular/core';
import { VehiculoI } from 'src/app/common/models/vehiculos.models';
import { FirestoreService } from 'src/app/common/services/firestore.service';
import { AlertController } from '@ionic/angular'; 

@Component({
  selector: 'app-admin-vehicle',
  templateUrl: './admin-vehicle.page.html',
  styleUrls: ['./admin-vehicle.page.scss'],
})
export class AdminVehiclePage implements OnInit {

  vehiculos: VehiculoI[] = [];
  newvehiculo: VehiculoI;
  cargando: boolean = false;
  vehiculo: VehiculoI;

  constructor(
    private firestoreService: FirestoreService,
    private alertController: AlertController 
  ) {
    this.loadvehiculos();
    this.initVehiculo();
  }

  ngOnInit() { }

  // Cargar la colección completa de vehículos
  loadvehiculos() {
    this.firestoreService.getCollectionChanges<VehiculoI>('Vehiculos').subscribe(data => {
      this.vehiculos = data;
    });
  }

  // Inicializar un nuevo vehículo con ID único
  initVehiculo() {
    this.newvehiculo = {
      nombre: null,
      patente: null,
      id: this.firestoreService.createIdDoc()
    };
  }

  // Validar campos antes de guardar o editar
  validateInputs(): boolean {
    if (!this.newvehiculo.nombre || !this.newvehiculo.patente) {
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
    await this.firestoreService.createDocument(this.newvehiculo, 'Vehiculos', this.newvehiculo.id);
    this.cargando = false;

    this.initVehiculo(); // Reiniciar el vehículo para los campos de entrada

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
            this.newvehiculo = vehiculo; // Asignar el vehículo a editar
          }
        }
      ]
    });
    await alert.present();
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

  // Obtener un vehículo por su UID (asegurarse de pasar un UID válido)
  getVehiculo(uid: string) {
    if (!uid) {
      console.error('El UID proporcionado es inválido');
      return;
    }

    this.firestoreService.getDocumentChanges<VehiculoI>('Vehiculos', uid).subscribe(data => {
      console.log('getVehiculo -> ', data);
      if (data) {
        this.vehiculo = data;
      }
    });
  }




  // Función para formatear la patente mientras el usuario escribe
  formatPatente() {
    let patente = this.newvehiculo.patente || '';
    patente = patente.toUpperCase().replace(/[^A-Z0-9]/g, ''); // Solo letras mayúsculas y números
    if (patente.length > 6) {
      patente = patente.slice(0, 5); // Limitar a 6 caracteres
    }

    // Formato XX-XX-XX
    const formattedPatente = patente.match(/.{1,2}/g)?.join('-') || patente;
    this.newvehiculo.patente = formattedPatente;
  }

  // Validar si la patente tiene el formato correcto
  isPatenteValid(): boolean {
    const regex = /^[A-Z0-9]{2}-[A-Z0-9]{2}-[A-Z0-9]{2}$/;
    return regex.test(this.newvehiculo.patente || '');
  }

  // Validar si el formulario es válido
  isFormValid(): boolean {
    return this.newvehiculo.nombre?.length <= 12 && this.isPatenteValid();
  }

}
