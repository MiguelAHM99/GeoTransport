import { Component, ElementRef, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Firestore, collection, getDocs, doc, setDoc, getDoc, deleteDoc } from '@angular/fire/firestore';
import { Geolocation } from '@capacitor/geolocation';
import { GoogleMap } from '@capacitor/google-maps';
import { environment } from 'src/environments/environment.prod';
import { SelectedServiceService } from 'src/app/services/selected-service.service';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-driver-map',
  templateUrl: './driver-map.page.html',
  styleUrls: ['./driver-map.page.scss'],
})
export class DriverMapPage implements OnInit, OnDestroy {

  @ViewChild('map') mapRef: ElementRef;
  map: GoogleMap;
  googleMapInstance: google.maps.Map; // Añadir una instancia de google.maps.Map

  currentPosition: string = 'Esperando posición...';
  currentMarker: google.maps.Marker | null = null;
  watchId: string | null = null; // Almacena el ID del watcher para detenerlo cuando sea necesario
  services: any[] = [];
  selectedService: string = '';
  rutas: any[] = [];
  selectedRuta: string = '';
  paraderoMarkers: google.maps.Marker[] = []; // Array para almacenar los marcadores de los paraderos
  positionInterval: any; // Variable para almacenar el intervalo
  ubicacionDocRef: any; // Variable para almacenar la referencia del primer documento de ubicación
  recorridoId: string; // Variable para almacenar el ID del recorrido

  recorridoIniciado: boolean = false; 
  serviceId: string;
  conductorId: string;
  conductorCorreo: string;
  vehiculos: any[] = []; // Añadir array para almacenar los vehículos
  selectedVehiculo: string = ''; // Añadir variable para almacenar el vehículo seleccionado

  constructor(
    private readonly firestore: Firestore,
    private readonly selectedServiceService: SelectedServiceService,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  ionViewDidEnter(){
    this.loadGoogleMaps().then(() => {
      this.createMap();
    });
  }

  async ngOnInit() {
    console.log('DriverMapPage inicializado');
    this.loadState();
    this.serviceId = this.selectedServiceService.getSelectedService();
    if (!this.serviceId) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      this.serviceId = user.selectedServicio;
    }
    console.log(`ID del servicio obtenido: ${this.serviceId}`);
    this.conductorId = this.authService.getCurrentUserId(); // Obtener el ID del usuario autenticado
    this.conductorCorreo = this.authService.getCurrentUserEmail(); // Obtener el correo del usuario autenticado
    console.log(`ID del conductor obtenido: ${this.conductorId}`);
    console.log(`Correo del conductor obtenido: ${this.conductorCorreo}`);
    if (this.serviceId) {
      await this.loadData();
      if (this.recorridoIniciado) {
        this.startPositionUpdates();
      }
    } else {
      console.error('ID del servicio no encontrado');
    }
  }

  ngOnDestroy() {
    this.saveState();
    this.stopPositionUpdates();
  }

  // Guardar el estado de la página en localStorage
  saveState() {
    const state = {
      conductorCorreo: this.conductorCorreo,
      serviceId: this.serviceId,
      recorridoIniciado: this.recorridoIniciado,
      selectedVehiculo: this.selectedVehiculo,
      selectedRuta: this.selectedRuta
    };
    localStorage.setItem('driverMapState', JSON.stringify(state));
  }

  // Cargar el estado de la página desde localStorage
  loadState() {
    const state = JSON.parse(localStorage.getItem('driverMapState') || '{}');
    this.conductorCorreo = state.conductorCorreo || this.authService.getCurrentUserEmail();
    this.serviceId = state.serviceId || this.selectedServiceService.getSelectedService();
    this.recorridoIniciado = state.recorridoIniciado || false;
    this.selectedVehiculo = state.selectedVehiculo || '';
    this.selectedRuta = state.selectedRuta || '';
  }

  loadGoogleMaps(): Promise<void> {
    return new Promise((resolve) => {
      if (typeof google !== 'undefined' && google.maps) {
        resolve();
      } else {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.mapsKey}`;
        script.onload = () => {
          resolve();
        };
        document.head.appendChild(script);
      }
    });
  }

  async createMap() {
    const mapStyles = [
      {
        featureType: 'poi',
        elementType: 'all',
        stylers: [{ visibility: 'off' }],
      },
      {
        featureType: 'transit',
        elementType: 'all',
        stylers: [{ visibility: 'off' }],
      },
      {
        featureType: 'road',
        elementType: 'labels.icon',
        stylers: [{ visibility: 'off' }],
      },
      {
        featureType: 'administrative',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }],
      },
      {
        featureType: 'landscape',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }],
      },
      {
        featureType: 'administrative.locality',
        elementType: 'labels.text',
        stylers: [{ visibility: 'on' }],
      },
    ];

    // Crear el mapa de Google usando Capacitor Google Maps
    this.map = await GoogleMap.create({
      id: 'my-map',
      element: this.mapRef.nativeElement,
      apiKey: environment.mapsKey,
      config: {
        center: { lat: -33.036, lng: -71.62963 },
        zoom: 8,
        styles: mapStyles,
        streetViewControl: false,
      },
    });

    // Obtener la instancia de google.maps.Map
    this.googleMapInstance = new google.maps.Map(this.mapRef.nativeElement, {
      center: { lat: -33.036, lng: -71.62963 },
      zoom: 8,
      styles: mapStyles,
      streetViewControl: false,
    });

    // Obtener la ubicación actual del usuario
    const coordinates = await Geolocation.getCurrentPosition();
    this.currentPosition = `Lat: ${coordinates.coords.latitude}, Lon: ${coordinates.coords.longitude}`;
    this.googleMapInstance.setCenter({ lat: coordinates.coords.latitude, lng: coordinates.coords.longitude });
    this.googleMapInstance.setZoom(15);

    if (this.currentMarker) {
      this.currentMarker.setMap(null);
    }

    this.currentMarker = new google.maps.Marker({
      position: { lat: coordinates.coords.latitude, lng: coordinates.coords.longitude },
      map: this.googleMapInstance,
      title: 'Mi ubicación',
      icon: 'assets/icon/car.png', // URL del icono azul para la ubicación del usuario
    });
  }

  async getServices() {
    console.log('Obteniendo servicios...');
    const servicesRef = collection(this.firestore, 'Servicios');
    const querySnapshot = await getDocs(servicesRef);
    this.services = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log('Servicios obtenidos:', this.services);
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
        return { id, ...rutaDoc.data() };
      }));
      console.log('Rutas obtenidas:', this.rutas);
    } catch (error) {
      console.error('Error al obtener rutas:', error);
    }
  }

  async getVehiculos() {
    try {
      console.log(`Obteniendo vehículos para el ID del servicio: ${this.serviceId} y conductor: ${this.conductorId}`);
      const vehiculosRef = collection(this.firestore, `Servicios/${this.serviceId}/usuarios/${this.conductorId}/vehiculos`);
      const querySnapshot = await getDocs(vehiculosRef);
      console.log('Instantánea de consulta de vehículos:', querySnapshot);
      console.log('Número de documentos de vehículos:', querySnapshot.size);

      this.vehiculos = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('Vehículos obtenidos:', this.vehiculos);
    } catch (error) {
      console.error('Error al obtener vehículos:', error);
    }
  }

  async getParaderos(rutaId: string) {
    console.log(`Obteniendo paraderos para la ruta ID: ${rutaId}`);
    const paraderosRef = collection(this.firestore, `Servicios/${this.selectedService}/rutas/${rutaId}/paraderos`);
    const querySnapshot = await getDocs(paraderosRef);
    const paraderos = querySnapshot.docs.map(doc => doc.data());
    console.log('Paraderos obtenidos:', paraderos);

    // Limpiar los marcadores de los paraderos anteriores
    for (const marker of this.paraderoMarkers) {
      marker.setMap(null);
    }
    this.paraderoMarkers = [];

    // Agregar nuevos marcadores
    for (const paradero of paraderos) {
      const marker = new google.maps.Marker({
        position: { lat: paradero['lat'], lng: paradero['lng'] },
        map: this.googleMapInstance,
        title: paradero['nombre'] || 'Paradero',
        icon: 'assets/icon/bus-stop.png', // URL del icono de parada para los paraderos
      });
      this.paraderoMarkers.push(marker); // Almacenar el marcador del paradero

      // Añadir listener para mostrar el nombre del paradero
      marker.addListener('click', () => {
        const infoWindow = new google.maps.InfoWindow({
          content: paradero['nombre'] || 'Paradero',
        });
        infoWindow.open(this.googleMapInstance, marker);
      });
    }
  }

  onServiceChange(serviceId: string) {
    console.log(`Servicio seleccionado: ${serviceId}`);
    this.selectedService = serviceId;
    this.getRutas();
  }

  onRutaChange(rutaId: string) {
    console.log(`Ruta seleccionada: ${rutaId}`);
    this.selectedRuta = rutaId;
    this.getParaderos(rutaId);
  }

  async UbicacionActual() {
    const coordinates = await Geolocation.getCurrentPosition();
    this.currentPosition = `Lat: ${coordinates.coords.latitude}, Lon: ${coordinates.coords.longitude}`;
    console.log(`Actualizando posición: ${this.currentPosition}`); // Añadir console.log para verificar la actualización
    this.googleMapInstance.setCenter({ lat: coordinates.coords.latitude, lng: coordinates.coords.longitude });
    this.googleMapInstance.setZoom(15);

    if (this.currentMarker) {
      this.currentMarker.setMap(null);
    }

    this.currentMarker = new google.maps.Marker({
      position: { lat: coordinates.coords.latitude, lng: coordinates.coords.longitude },
      map: this.googleMapInstance,
      title: 'Mi ubicación',
      icon: 'assets/icon/car.png', // URL del icono azul para la ubicación del usuario
    });


    // Actualizar la ubicación en Firestore
    if (this.ubicacionDocRef) {
      await setDoc(this.ubicacionDocRef, {
        lat: coordinates.coords.latitude,
        lng: coordinates.coords.longitude,
        nombreVehiculo: this.vehiculos.find(vehiculo => vehiculo.id === this.selectedVehiculo)?.nombre,
        timestamp: new Date(),
        recorridoId: this.recorridoId // Añadir el ID del recorrido
      });
    }
  }

  startPositionUpdates() {
    this.positionInterval = setInterval(() => {
      this.UbicacionActual();
    }, 3000); // Actualizar cada 3 segundos
  }

  stopPositionUpdates() {
    if (this.positionInterval) {
      clearInterval(this.positionInterval);
      this.positionInterval = null;
    }
  }

  async iniciarRecorrido() {
    this.recorridoIniciado = true;

    // Obtener detalles de la ruta seleccionada
    const rutaSeleccionada = this.rutas.find(ruta => ruta.id === this.selectedRuta);
    const vehiculoSeleccionado = this.vehiculos.find(vehiculo => vehiculo.id === this.selectedVehiculo);
    

    if (rutaSeleccionada && vehiculoSeleccionado) {
      try {
        // Eliminar la colección de ubicaciones existente
        const ubicacionesRef = collection(this.firestore, `Servicios/${this.serviceId}/usuarios/${this.conductorId}/ubicacion`);
        const ubicacionesSnapshot = await getDocs(ubicacionesRef);
        const deletePromises = ubicacionesSnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);

        // Asignar el ID de la ruta seleccionada al recorridoId
        this.recorridoId = rutaSeleccionada.id;

        // Crear el primer documento de ubicación y almacenar su referencia
        this.ubicacionDocRef = doc(this.firestore, `Servicios/${this.serviceId}/usuarios/${this.conductorId}/ubicacion/ubicacion-actual`);
        const coordinates = await Geolocation.getCurrentPosition();
        await setDoc(this.ubicacionDocRef, {
          lat: coordinates.coords.latitude,
          lng: coordinates.coords.longitude,
          timestamp: new Date(),
          nombreVehiculo: this.vehiculos.find(vehiculo => vehiculo.id === this.selectedVehiculo)?.nombre,
          recorridoId: this.recorridoId // Añadir el ID del recorrido
        });

        // Generar ID personalizado para el historial
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

        // Iniciar la actualización de la posición
        this.startPositionUpdates();
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
        // Generar ID personalizado para el historial
        const timestamp = new Date();
        const idPersonalizado = `${timestamp.getFullYear()}-${(timestamp.getMonth() + 1).toString().padStart(2, '0')}-${timestamp.getDate().toString().padStart(2, '0')}-${timestamp.getHours().toString().padStart(2, '0')}-${timestamp.getMinutes().toString().padStart(2, '0')}-${timestamp.getSeconds().toString().padStart(2, '0')}-Fin-${this.conductorCorreo}`;

        // Guardar en la colección historial
        const historialRef = doc(this.firestore, `Servicios/${this.serviceId}/historial/${idPersonalizado}`);
        await setDoc(historialRef, {
          conductor: this.conductorCorreo,
          patente: vehiculoSeleccionado.patente,
          nombreVehiculo: vehiculoSeleccionado.nombre,
          nombreRuta: rutaSeleccionada.nombre,
          estado: 'Fin de ruta',
          timestamp: timestamp
        });
        console.log('Historial guardado correctamente');

        // Detener la actualización de la posición
        this.stopPositionUpdates();

        // Eliminar la colección de ubicaciones
        const ubicacionesRef = collection(this.firestore, `Servicios/${this.serviceId}/usuarios/${this.conductorId}/ubicacion`);
        const ubicacionesSnapshot = await getDocs(ubicacionesRef);
        const deletePromises = ubicacionesSnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
      } catch (error) {
        console.error('Error guardando en el historial:', error);
      }
    } else {
      console.error('Ruta o vehículo no seleccionados correctamente');
    }
  }

  // Método para cargar datos necesarios
  async loadData() {
    await this.getRutas();
    await this.getVehiculos();
  }

  // Método para refrescar datos
  async refrescarDatos() {
    await this.loadData();
  }

  // Método para cerrar sesión
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}