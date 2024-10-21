import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VehiculoI } from 'src/app/common/models/vehiculos.models';
import { FirestoreService } from 'src/app/common/services/firestore.service';
import { AlertController } from '@ionic/angular';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { SelectedServiceService } from 'src/app/services/selected-service.service';

@Component({
  selector: 'app-admin-edit-vehicle',
  templateUrl: './admin-edit-vehicle.page.html',
  styleUrls: ['./admin-edit-vehicle.page.scss'],
})
export class AdminEditVehiclePage implements OnInit {

  vehiculoId: string;
  newVehiculo: VehiculoI;
  cargando: boolean = false;
  selectedServicio: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private firestoreService: FirestoreService,
    private alertController: AlertController,
    private firestore: Firestore,
    private selectedServiceService: SelectedServiceService
  ) {
    this.initVehiculo();
  }

  ngOnInit() {
    this.selectedServicio = this.selectedServiceService.getSelectedService();
    // Obtener el ID del vehículo desde la URL
    this.vehiculoId = this.route.snapshot.paramMap.get('id');
    if (this.vehiculoId) {
      this.loadVehicleData();
    }
  }

  // Inicializar un nuevo vehículo
  initVehiculo() {
    this.newVehiculo = {
      nombre: '',
      patente: '',
      id: ''
    };
  }

  // Cargar los datos del vehículo desde Firestore
  async loadVehicleData() {
    if (!this.selectedServicio || !this.vehiculoId) return;

    this.cargando = true;
    const vehiculoDocRef = doc(this.firestore, `Servicios/${this.selectedServicio}/vehiculos/${this.vehiculoId}`);
    const docSnap = await getDoc(vehiculoDocRef);

    if (docSnap.exists()) {
      this.newVehiculo = docSnap.data() as VehiculoI; // Cargar los datos del vehículo en el formulario
    } else {
      this.showAlert('Error', 'Vehículo no encontrado.');
      this.router.navigate(['/admin-vehicle']); // Redirigir si no se encuentra el vehículo
    }
    this.cargando = false;
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

  // Guardar los cambios del vehículo en Firestore
  async save() {
    if (!this.validateInputs()) return; // Si la validación falla, detener el guardado.
    this.cargando = true;
    if (this.vehiculoId) {
      await this.firestoreService.updateDocument(this.newVehiculo, `Servicios/${this.selectedServicio}/vehiculos`, this.vehiculoId);
    } else {
      this.newVehiculo.id = this.firestoreService.createIdDoc();
      await this.firestoreService.createDocument(this.newVehiculo, `Servicios/${this.selectedServicio}/vehiculos`, this.newVehiculo.id);
    }
    this.cargando = false;
    this.router.navigate(['/admin-vehicle']); // Redirigir a la lista de vehículos después de guardar
  }

  // Validar campos antes de guardar o editar
  validateInputs(): boolean {
    if (!this.newVehiculo.nombre || !this.newVehiculo.patente) {
      this.showAlert('Error', 'Por favor completa todos los campos');
      return false;
    }
    return true;
  }
  formatPatente() {
    let patente = this.newVehiculo.patente || '';
    patente = patente.toUpperCase().replace(/[^A-Z0-9]/g, ''); // Solo letras mayúsculas y números
    if (patente.length > 6) {
      patente = patente.slice(0, 5); // Limitar a 6 caracteres
    }

    // Formato XX-XX-XX
    const formattedPatente = patente.match(/.{1,2}/g)?.join('-') || patente;
    this.newVehiculo.patente = formattedPatente;
  }

  // Validar si la patente tiene el formato correcto
  isPatenteValid(): boolean {
    const regex = /^[A-Z0-9]{2}-[A-Z0-9]{2}-[A-Z0-9]{2}$/;
    return regex.test(this.newVehiculo.patente || '');
  }

  // Validar si el formulario es válido
  isFormValid(): boolean {
    return this.newVehiculo.nombre?.length <= 12 && this.isPatenteValid();
  }
}