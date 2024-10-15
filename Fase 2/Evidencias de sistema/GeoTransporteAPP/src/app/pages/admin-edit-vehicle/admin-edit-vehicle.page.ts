import { Component, OnInit } from '@angular/core';
import { VehiculoI } from 'src/app/common/models/vehiculos.models';
import { FirestoreService } from 'src/app/common/services/firestore.service';
import { AlertController } from '@ionic/angular'; 
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-admin-edit-vehicle',
  templateUrl: './admin-edit-vehicle.page.html',
  styleUrls: ['./admin-edit-vehicle.page.scss'],
})
export class AdminEditVehiclePage implements OnInit {

  vehiculo: VehiculoI;
  cargando: boolean = false;

  newvehiculo: VehiculoI = {
    nombre: '',
    patente: '',
    id: '',
    // Asegúrate de tener las propiedades necesarias
  };
  vehiculoId: string;

  constructor(
    private firestoreService: FirestoreService,
    private alertController: AlertController,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    // Obtener el ID del vehículo desde la URL
    this.vehiculoId = this.route.snapshot.paramMap.get('id');
    if (this.vehiculoId) {
      this.loadVehicleData();
    }
  }

 // Cargar los datos del vehículo desde Firestore
 loadVehicleData() {
  this.cargando = true;
  this.firestoreService.getDocument<VehiculoI>('Vehiculos', this.vehiculoId)
    .then(doc => {
      if (doc.exists()) {
        this.newvehiculo = doc.data(); // Cargar los datos del vehículo en el formulario
      } else {
        this.showAlert('Error', 'Vehículo no encontrado.');
        this.router.navigate(['/admin-vehicle']); // Redirigir si no se encuentra el vehículo
      }
      this.cargando = false;
    })
    .catch(err => {
      console.error('Error al obtener el vehículo:', err);
      this.showAlert('Error', 'Error al cargar los datos del vehículo.');
      this.cargando = false;
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

  // Validar campos antes de guardar o editar
  validateInputs(): boolean {
    if (!this.newvehiculo.nombre || !this.newvehiculo.patente) {
      this.showAlert('Error', 'Por favor completa todos los campos');
      return false;
    }
    return true;
  }
    
 // Guardar o editar el vehículo en Firestore
 async save() {
  if (!this.validateInputs()) return; // Validar campos

  this.cargando = true;
  if (this.vehiculoId) {
    await this.firestoreService.updateDocument(this.newvehiculo, 'Vehiculos', this.vehiculoId);
  } else {
    this.newvehiculo.id = this.firestoreService.createIdDoc();
    await this.firestoreService.createDocument(this.newvehiculo, 'Vehiculos', this.newvehiculo.id);
  }

  this.router.navigate(['/admin-vehicle']); // Redirigir después de guardar
  this.cargando = false;
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
