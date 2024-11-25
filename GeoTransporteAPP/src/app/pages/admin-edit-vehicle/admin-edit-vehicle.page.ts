import { Component, OnInit } from '@angular/core';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { VehiculoI } from 'src/app/models/vehiculos.models';
import { FirestoreService } from 'src/app/services/firestore.service';
import { SelectedServiceService } from 'src/app/services/selected-service.service';

@Component({
  selector: 'app-admin-edit-vehicle',
  templateUrl: './admin-edit-vehicle.page.html',
  styleUrls: ['./admin-edit-vehicle.page.scss'],
})
export class AdminEditVehiclePage implements OnInit {

  newVehiculo: VehiculoI = {
    id: '',
    nombre: '',
    patente: ''
  };
  selectedServicio: string;
  cargando: boolean = false;

  constructor(
    private readonly firestore: Firestore,
    private readonly alertController: AlertController,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly firestoreService: FirestoreService,
    private readonly selectedServiceService: SelectedServiceService
  ) {
    this.selectedServicio = this.selectedServiceService.getSelectedService();
  }

  ngOnInit() {
    const vehiculoId = this.route.snapshot.paramMap.get('id');
    if (vehiculoId) {
      this.loadVehiculo(vehiculoId);
    }
  }

  // Cargar los datos del vehículo desde Firestore
  async loadVehiculo(id: string) {
    const vehiculoDocRef = doc(this.firestore, `Servicios/${this.selectedServicio}/vehiculos/${id}`);
    const docSnap = await getDoc(vehiculoDocRef);
    if (docSnap.exists()) {
      this.newVehiculo = docSnap.data() as VehiculoI;
      this.newVehiculo.id = docSnap.id;
    } else {
      this.showAlert('Error', 'Vehículo no encontrado.');
      this.router.navigate(['/admin-vehicle']);
    }
  }

  // Guardar los datos del vehículo en Firestore
  async save() {
    if (!this.validateInputs()) return; // Si la validación falla, detener el guardado.

    this.cargando = true;
    try {
      if (!this.newVehiculo.id) {
        this.newVehiculo.id = this.firestoreService.createIdDoc();
      }
      const vehiculoDocRef = doc(this.firestore, `Servicios/${this.selectedServicio}/vehiculos/${this.newVehiculo.id}`);
      await setDoc(vehiculoDocRef, this.newVehiculo);
      this.showAlert('Éxito', 'Vehículo guardado correctamente.');
      this.router.navigate(['/admin-vehicle']);
    } catch (error) {
      console.error('Error al guardar el vehículo:', error);
      this.showAlert('Error', 'Hubo un error al guardar el vehículo. Por favor, inténtelo de nuevo.');
    } finally {
      this.cargando = false;
    }
  }

  // Validar si los campos del vehículo son válidos
  validateInputs(): boolean {
    return !!this.newVehiculo.nombre && !!this.newVehiculo.patente && this.isPatenteValid();
  }

  // Validar si la patente tiene el formato correcto
  isPatenteValid(): boolean {
    const regex = /^[A-Z0-9]{2}-[A-Z0-9]{2}-[A-Z0-9]{2}$/;
    return regex.test(this.newVehiculo.patente);
  }

  // Formatear la patente
  formatPatente(event: any) {
    const input = event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const formatted = input.slice(0, 2) + (input.length > 2 ? '-' : '') + input.slice(2, 4) + (input.length > 4 ? '-' : '') + input.slice(4, 6);
    this.newVehiculo.patente = formatted;
  }

  // Verificar si el formulario es válido
  isFormValid(): boolean {
    return this.validateInputs();
  }

  // Mostrar un alert de error o éxito
  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}