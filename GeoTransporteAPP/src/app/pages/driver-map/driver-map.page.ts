import { Component, OnInit } from '@angular/core';
import { Firestore, collection, getDocs, doc, getDoc } from '@angular/fire/firestore';
import { SelectedServiceService } from 'src/app/services/selected-service.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-driver-map',
  templateUrl: './driver-map.page.html',
  styleUrls: ['./driver-map.page.scss'],
})
export class DriverMapPage implements OnInit {
  rutas: any[] = [];
  vehiculos: any[] = [];
  selectedRuta: string;
  selectedVehiculo: string;
  serviceId: string;
  conductorId: string;
  cargando: boolean = false;

  constructor(
    private firestore: Firestore,
    private selectedServiceService: SelectedServiceService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    console.log('DriverMapPage inicializado');
    this.serviceId = this.selectedServiceService.getSelectedService();
    console.log(`ID del servicio obtenido: ${this.serviceId}`);
    this.conductorId = this.authService.getCurrentUserId(); // Obtener el ID del usuario autenticado
    console.log(`ID del conductor obtenido: ${this.conductorId}`);
    this.getRutas();
    this.getVehiculos();
  }

  async getRutas() {
    try {
      console.log(`Obteniendo rutas para el ID del servicio: ${this.serviceId} y conductor: ${this.conductorId}`);
      const rutasRef = collection(this.firestore, `Servicios/${this.serviceId}/usuarios/${this.conductorId}/rutas`);
      const querySnapshot = await getDocs(rutasRef);
      console.log('Instantánea de consulta de rutas:', querySnapshot);
      console.log('Número de documentos de rutas:', querySnapshot.size);
      const rutaIds = querySnapshot.docs.map(doc => doc.id);
      console.log('IDs de rutas obtenidos:', rutaIds);

      // Obtener detalles de las rutas desde la colección general del servicio
      this.rutas = await Promise.all(rutaIds.map(async id => {
        const rutaDocRef = doc(this.firestore, `Servicios/${this.serviceId}/rutas/${id}`);
        const rutaDoc = await getDoc(rutaDocRef);
        if (rutaDoc.exists()) {
          const data = rutaDoc.data();
          console.log(`Datos del documento de ruta para el ID ${id}:`, data);
          return { id, ...data };
        }
        return null;
      })).then(results => results.filter(result => result !== null));
      console.log('Rutas obtenidas:', this.rutas);
    } catch (error) {
      console.error('Error obteniendo rutas:', error);
    }
  }

  async getVehiculos() {
    try {
      console.log(`Obteniendo vehículos para el ID del servicio: ${this.serviceId} y conductor: ${this.conductorId}`);
      const vehiculosRef = collection(this.firestore, `Servicios/${this.serviceId}/usuarios/${this.conductorId}/vehiculos`);
      const querySnapshot = await getDocs(vehiculosRef);
      console.log('Instantánea de consulta de vehículos:', querySnapshot);
      console.log('Número de documentos de vehículos:', querySnapshot.size);
      const vehiculoIds = querySnapshot.docs.map(doc => doc.id);
      console.log('IDs de vehículos obtenidos:', vehiculoIds);

      // Obtener detalles de los vehículos desde la colección general del servicio
      this.vehiculos = await Promise.all(vehiculoIds.map(async id => {
        const vehiculoDocRef = doc(this.firestore, `Servicios/${this.serviceId}/vehiculos/${id}`);
        const vehiculoDoc = await getDoc(vehiculoDocRef);
        if (vehiculoDoc.exists()) {
          const data = vehiculoDoc.data();
          console.log(`Datos del documento de vehículo para el ID ${id}:`, data);
          return { id, ...data };
        }
        return null;
      })).then(results => results.filter(result => result !== null));
      console.log('Vehículos obtenidos:', this.vehiculos);
    } catch (error) {
      console.error('Error obteniendo vehículos:', error);
    }
  }
}