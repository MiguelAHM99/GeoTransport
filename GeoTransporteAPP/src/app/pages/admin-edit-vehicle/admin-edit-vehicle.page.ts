import { Component, OnInit } from '@angular/core';
import { VehiculoI } from 'src/app/common/models/vehiculos.models';
import { FirestoreService } from 'src/app/common/services/firestore.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Firestore, doc, getDoc, setDoc, collection, getDocs, query, where } from '@angular/fire/firestore';
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
    private firestoreService: FirestoreService,
    private route: ActivatedRoute,
    private router: Router,
    private alertController: AlertController,
    private firestore: Firestore,
    private selectedServiceService: SelectedServiceService
  ) { 
    this.vehiculoId = this.route.snapshot.paramMap.get('id');
    this.selectedServicio = this.selectedServiceService.getSelectedService();
    if (this.vehiculoId) {
      this.getVehiculo(this.vehiculoId);
    }
  }

  ngOnInit() {}

  // Obtener los datos del vehículo desde Firestore
  async getVehiculo(id: string) {
    if (!this.selectedServicio) return;

    this.cargando = true;
    const vehiculoDocRef = doc(this.firestore, `Servicios/${this.selectedServicio}/vehiculos/${id}`);
    const docSnap = await getDoc(vehiculoDocRef);

    if (docSnap.exists()) {
      this.newVehiculo = docSnap.data() as VehiculoI;
    } else {
      this.showAlert('Error', 'Vehículo no encontrado.');
      this.router.navigate(['/admin-vehicle']);
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

  // Guardar los datos del vehículo en Firestore
  async save() {
    if (!this.validateInputs()) return; // Si la validación falla, detener el guardado.

    // Verificar si ya existe un vehículo con la misma patente
    const vehiculosRef = collection(this.firestore, `Servicios/${this.selectedServicio}/vehiculos`);
    const q = query(vehiculosRef, where('patente', '==', this.newVehiculo.patente));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      this.showAlert('Error', 'Ya existe un vehículo con esta patente.');
      return;
    }

    this.cargando = true;
    if (this.vehiculoId) {
      await setDoc(doc(this.firestore, `Servicios/${this.selectedServicio}/vehiculos`, this.vehiculoId), this.newVehiculo);
    } else {
      this.newVehiculo.id = this.firestoreService.createIdDoc();
      await setDoc(doc(this.firestore, `Servicios/${this.selectedServicio}/vehiculos`, this.newVehiculo.id), this.newVehiculo);
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
}