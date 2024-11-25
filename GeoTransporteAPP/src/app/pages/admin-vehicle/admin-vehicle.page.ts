import { Component, OnInit } from '@angular/core';
import { VehiculoI } from 'src/app/models/vehiculos.models';
import { FirestoreService } from 'src/app/services/firestore.service';
import { AlertController } from '@ionic/angular';
import { Firestore, collection, getDocs, doc, deleteDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { SelectedServiceService } from 'src/app/services/selected-service.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-admin-vehicle',
  templateUrl: './admin-vehicle.page.html',
  styleUrls: ['./admin-vehicle.page.scss'],
})
export class AdminVehiclePage implements OnInit {

  vehiculos: VehiculoI[] = [];
  newVehiculo: VehiculoI = {
    id: '',
    nombre: '',
    patente: ''
  };
  cargando: boolean = false;
  selectedServicio: string;
  sessionStartedRecently: boolean = false;
  isSessionFromLocalStorage: boolean = false;

  constructor(
    private readonly firestoreService: FirestoreService,
    private readonly alertController: AlertController,
    private readonly firestore: Firestore,
    private readonly router: Router,
    private readonly selectedServiceService: SelectedServiceService,
    private readonly authService: AuthService
  ) { }

  ngOnInit() {
    this.authService.sessionStartedRecently().subscribe(recentlyStarted => {
      this.sessionStartedRecently = recentlyStarted;
    });

    this.authService.isSessionFromLocalStorage().subscribe(fromLocalStorage => {
      this.isSessionFromLocalStorage = fromLocalStorage;
    });

    const loggedUser = JSON.parse(localStorage.getItem('user') || 'null');
    if (loggedUser) {
      this.selectedServicio = loggedUser.selectedServicio;
      console.log('Usuario autenticado, servicio seleccionado:', this.selectedServicio);
      this.loadVehiculos();
    } else {
      // Redirigir al usuario a la página de login si no está autenticado
      console.log('Usuario no autenticado, redirigiendo a login');
      this.router.navigate(['/login']);
    }
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
    if (this.isSessionFromLocalStorage) {
      this.showAlertAndRedirect('Sesión expirada', 'Debes iniciar sesión nuevamente para guardar un vehículo.');
      return;
    }

    if (!this.validateInputs()) return; // Si la validación falla, detener el guardado.
    this.cargando = true;
    await this.firestoreService.createDocument(this.newVehiculo, `Servicios/${this.selectedServicio}/vehiculos`, this.newVehiculo.id);
    this.cargando = false;

    this.initVehiculo(); // Reiniciar el vehículo para los campos de entrada
    this.loadVehiculos(); // Recargar la lista de vehículos
  }

  // Editar un vehículo existente
  async edit(vehiculo: VehiculoI) {
    if (this.isSessionFromLocalStorage) {
      this.showAlertAndRedirect('Sesión expirada', 'Debes iniciar sesión nuevamente para editar un vehículo.');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: `¿Estás seguro de que deseas editar el vehículo: ${vehiculo.nombre}?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Confirmar', handler: () => {
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
    if (this.isSessionFromLocalStorage) {
      this.showAlertAndRedirect('Sesión expirada', 'Debes iniciar sesión nuevamente para eliminar un vehículo.');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: `¿Estás seguro de que deseas eliminar el vehículo: ${vehiculo.nombre}?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Confirmar', handler: async () => {
            this.cargando = true;
            console.log('Eliminando vehículo:', vehiculo.id);
            try {
              await deleteDoc(doc(this.firestore, `Servicios/${this.selectedServicio}/vehiculos/${vehiculo.id}`));
              console.log('Vehículo eliminado:', vehiculo.id);
              this.loadVehiculos(); // Recargar la lista de vehículos
            } catch (error) {
              console.error('Error al eliminar el vehículo:', error);
            } finally {
              this.cargando = false;
            }
          }
        }
      ]
    });
    await alert.present();
  }

  // Crear un nuevo vehículo
  create() {
    if (this.isSessionFromLocalStorage) {
      this.showAlertAndRedirect('Sesión expirada', 'Debes iniciar sesión nuevamente para agregar un nuevo vehículo.');
      return;
    }

    this.router.navigate(['/admin-edit-vehicle']);
  }

  // Mostrar un alert de error o éxito y redirigir al login
  async showAlertAndRedirect(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
    await alert.onDidDismiss();
    this.router.navigate(['/login']);
  }
}