import { Component, OnInit } from '@angular/core';
import { VehiculoI } from 'src/app/models/vehiculos.models';
import { FirestoreService } from 'src/app/services/firestore.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
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
  cargando: boolean = false;
  selectedServicio: string;
  vehiculoId: string | null = null;

  constructor(
    private readonly firestoreService: FirestoreService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly alertController: AlertController,
    private readonly firestore: Firestore,
    private readonly selectedServiceService: SelectedServiceService
  ) {}

  ngOnInit() {
    const loggedUser = JSON.parse(localStorage.getItem('user') || 'null');
    if (loggedUser) {
      this.selectedServicio = loggedUser.selectedServicio;
      this.vehiculoId = this.route.snapshot.paramMap.get('id');
      if (this.vehiculoId) {
        this.loadVehiculo();
      }
    } else {
      // Redirigir al usuario a la página de login si no está autenticado
      this.router.navigate(['/login']);
    }
  }

  // Cargar los datos del vehículo
  async loadVehiculo() {
    if (!this.selectedServicio || !this.vehiculoId) return;

    const vehiculoDocRef = doc(this.firestore, `Servicios/${this.selectedServicio}/vehiculos/${this.vehiculoId}`);
    const vehiculoDoc = await getDoc(vehiculoDocRef);
    if (vehiculoDoc.exists()) {
      this.newVehiculo = vehiculoDoc.data() as VehiculoI;
      this.newVehiculo.id = vehiculoDoc.id;
    } else {
      console.error('Vehículo no encontrado');
    }
  }

  // Guardar los cambios del vehículo en Firestore
  async save() {
    if (!this.validateInputs()) return; // Si la validación falla, detener el guardado.
    this.cargando = true;
    const vehiculoDocRef = doc(this.firestore, `Servicios/${this.selectedServicio}/vehiculos/${this.newVehiculo.id}`);
    await setDoc(vehiculoDocRef, this.newVehiculo);
    this.cargando = false;

    // Mostrar mensaje de éxito y redirigir
    this.showAlert('Éxito', 'Vehículo actualizado correctamente');
    this.router.navigate(['/admin-vehicle']);
  }

  validateInputs(): boolean {
    if (!this.newVehiculo.nombre || !this.newVehiculo.patente) {
      this.showAlert('Error', 'Por favor completa todos los campos');
      return false;
    }
    return true;
  }

  // Validar si el formulario es válido
  isFormValid(): boolean {
    return !!this.newVehiculo.nombre && !!this.newVehiculo.patente && this.isPatenteValid();
  }

  // Validar si la patente tiene el formato correcto
  isPatenteValid(): boolean {
    const regex = /^[A-Z]{2}-[A-Z]{2}-[0-9]{2}$/;
    return regex.test(this.newVehiculo.patente);
  }

  // Formatear la patente
  formatPatente(event: any) {
    const input = event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const formatted = input.slice(0, 2) + (input.length > 2 ? '-' : '') + input.slice(2, 4) + (input.length > 4 ? '-' : '') + input.slice(4, 6);
    this.newVehiculo.patente = formatted;
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