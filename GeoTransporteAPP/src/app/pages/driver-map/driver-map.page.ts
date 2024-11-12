import { Component, OnInit } from '@angular/core';
import { Firestore, collection, getDocs, doc, getDoc, setDoc } from '@angular/fire/firestore';
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
  conductorCorreo: string;
  cargando: boolean = false;
  recorridoIniciado: boolean = false; 

  constructor(
    private readonly firestore: Firestore,
    private readonly selectedServiceService: SelectedServiceService,
    private readonly authService: AuthService
  ) {}

  async ngOnInit() {
    console.log('DriverMapPage inicializado');
    this.serviceId = this.selectedServiceService.getSelectedService();
    console.log(`ID del servicio obtenido: ${this.serviceId}`);
    this.conductorId = this.authService.getCurrentUserId(); // Obtener el ID del usuario autenticado
    this.conductorCorreo = this.authService.getCurrentUserEmail(); // Obtener el correo del usuario autenticado
    console.log(`ID del conductor obtenido: ${this.conductorId}`);
    console.log(`Correo del conductor obtenido: ${this.conductorCorreo}`);
    await this.getRutas();
    await this.getVehiculos();
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

      // Obtener IDs de vehículos del conductor
      const conductorVehiculosRef = collection(this.firestore, `Conductores/${this.conductorId}/vehiculos`);
      const conductorVehiculosSnapshot = await getDocs(conductorVehiculosRef);
      const conductorVehiculosIds = conductorVehiculosSnapshot.docs.map(doc => doc.id);
      console.log('IDs de vehículos del conductor:', conductorVehiculosIds);
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

  async iniciarRecorrido() {
    this.recorridoIniciado = true;

    // Obtener detalles de la ruta seleccionada
    const rutaSeleccionada = this.rutas.find(ruta => ruta.id === this.selectedRuta);
    const vehiculoSeleccionado = this.vehiculos.find(vehiculo => vehiculo.id === this.selectedVehiculo);

    if (rutaSeleccionada && vehiculoSeleccionado) {
      try {
        // Generar ID personalizado
        const timestamp = new Date();
        const idPersonalizado = `${timestamp.getFullYear()}-${(timestamp.getMonth() + 1).toString().padStart(2, '0')}-${timestamp.getDate().toString().padStart(2, '0')}-${timestamp.getHours().toString().padStart(2, '0')}-${timestamp.getMinutes().toString().padStart(2, '0')}-${timestamp.getSeconds().toString().padStart(2, '0')}-Inicio-${this.conductorCorreo}`;

        // Guardar en la colección historial
        const historialRef = doc(this.firestore, `Servicios/${this.serviceId}/historial/${idPersonalizado}`);
        await setDoc(historialRef, {
          conductor: this.conductorCorreo,
          patente: vehiculoSeleccionado.patente,
          nombreVehiculo: vehiculoSeleccionado.nombre,
          nombreRuta: rutaSeleccionada.nombre,
          estado: 'Inicio de ruta',
          timestamp: timestamp
        });
        console.log('Historial guardado correctamente');
      } catch (error) {
        console.error('Error guardando en el historial:', error);
      }
    } else {
      console.error('Ruta o vehículo no seleccionados correctamente');
    }
  }

  async finalizarRecorrido() {
    this.recorridoIniciado = false;

    // Obtener detalles de la ruta seleccionada
    const rutaSeleccionada = this.rutas.find(ruta => ruta.id === this.selectedRuta);
    const vehiculoSeleccionado = this.vehiculos.find(vehiculo => vehiculo.id === this.selectedVehiculo);

    if (rutaSeleccionada && vehiculoSeleccionado) {
      try {
        // Generar ID personalizado
        const timestamp = new Date();
        const idPersonalizado = `${timestamp.getFullYear()}-${(timestamp.getMonth() + 1).toString().padStart(2, '0')}-${timestamp.getDate().toString().padStart(2, '0')}-${timestamp.getHours().toString().padStart(2, '0')}-${timestamp.getMinutes().toString().padStart(2, '0')}-${timestamp.getSeconds().toString().padStart(2, '0')}-Termino-${this.conductorCorreo}`;

        // Guardar en la colección historial
        const historialRef = doc(this.firestore, `Servicios/${this.serviceId}/historial/${idPersonalizado}`);
        await setDoc(historialRef, {
          conductor: this.conductorCorreo,
          patente: vehiculoSeleccionado.patente,
          nombreVehiculo: vehiculoSeleccionado.nombre,
          nombreRuta: rutaSeleccionada.nombre,
          estado: 'Ruta finalizada',
          timestamp: timestamp
        });
        console.log('Historial guardado correctamente');
      } catch (error) {
        console.error('Error guardando en el historial:', error);
      }
    } else {
      console.error('Ruta o vehículo no seleccionados correctamente');
    }
  }
}