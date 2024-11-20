import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';
import { Geolocation } from '@capacitor/geolocation';
import { GoogleMap } from '@capacitor/google-maps';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-user-map',
  templateUrl: './user-map.page.html',
  styleUrls: ['./user-map.page.scss'],
})
export class UserMapPage implements OnInit {

  @ViewChild('map') mapRef: ElementRef;
  map: GoogleMap;

  currentPosition: string = 'Esperando posición...';
  currentMarkerId: string | null = null;
  watchId: string | null = null; // Almacena el ID del watcher para detenerlo cuando sea necesario
  services: any[] = [];
  selectedService: string = '';
  rutas: any[] = [];
  selectedRuta: string = '';
  paraderoMarkers: string[] = []; // Array para almacenar los IDs de los marcadores de los paraderos

  constructor(private readonly firestore: Firestore) { }

  ionViewDidEnter(){
    this.createMap();
  }

  async ngOnInit() {
    await this.getServices();
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

    this.map = await GoogleMap.create({
      id: 'my-map',
      element: this.mapRef.nativeElement,
      apiKey: environment.mapsKey, 
      config: {
        center: {
          lat: -33.036,
          lng: -71.62963,
        },
        zoom: 8,
        styles: mapStyles, // Aplicar los estilos al mapa
        streetViewControl: false, // Desactivar el Street View
      },
    });

    // Obtener la ubicación actual del usuario
    const coordinates = await Geolocation.getCurrentPosition();
    this.currentPosition = `Lat: ${coordinates.coords.latitude}, Lon: ${coordinates.coords.longitude}`;
    this.map.setCamera({
      coordinate: {
        lat: coordinates.coords.latitude,
        lng: coordinates.coords.longitude,
      },
      zoom: 15,
    });

    if (this.currentMarkerId) {
      this.map.removeMarker(this.currentMarkerId);
    }

    this.currentMarkerId = await this.map.addMarker({
      coordinate: {
        lat: coordinates.coords.latitude,
        lng: coordinates.coords.longitude,
      },
      title: 'Mi ubicación',
    });
  }

  async getServices() {
    console.log('Obteniendo servicios...');
    const servicesRef = collection(this.firestore, 'Servicios');
    const querySnapshot = await getDocs(servicesRef);
    this.services = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log('Servicios obtenidos:', this.services);
  }

  async getRutas(serviceId: string) {
    console.log(`Obteniendo rutas para el ID del servicio: ${serviceId}`);
    const rutasRef = collection(this.firestore, `Servicios/${serviceId}/rutas`);
    const querySnapshot = await getDocs(rutasRef);
    this.rutas = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log('Rutas obtenidas:', this.rutas);
  }

  async getParaderos(rutaId: string) {
    console.log(`Obteniendo paraderos para la ruta ID: ${rutaId}`);
    const paraderosRef = collection(this.firestore, `Servicios/${this.selectedService}/rutas/${rutaId}/paraderos`);
    const querySnapshot = await getDocs(paraderosRef);
    const paraderos = querySnapshot.docs.map(doc => doc.data());
    console.log('Paraderos obtenidos:', paraderos);

    // Limpiar los marcadores de los paraderos anteriores
    for (const markerId of this.paraderoMarkers) {
      await this.map.removeMarker(markerId);
    }
    this.paraderoMarkers = [];

    // Marcar los paraderos en el mapa
    for (const paradero of paraderos) {
      const markerId = await this.map.addMarker({
        coordinate: {
          lat: paradero['lat'],
          lng: paradero['lng'],
        },
        title: paradero['nombre'] || 'Paradero',
      });
      this.paraderoMarkers.push(markerId); // Almacenar el ID del marcador del paradero
    }
  }

  onServiceChange(serviceId: string) {
    console.log(`Servicio seleccionado: ${serviceId}`);
    this.selectedService = serviceId;
    this.getRutas(serviceId);
  }

  onRutaChange(rutaId: string) {
    console.log(`Ruta seleccionada: ${rutaId}`);
    this.selectedRuta = rutaId;
    this.getParaderos(rutaId);
  }

  async UbicacionActual() {
    const coordinates = await Geolocation.getCurrentPosition();
    this.currentPosition = `Lat: ${coordinates.coords.latitude}, Lon: ${coordinates.coords.longitude}`;
    this.map.setCamera({
      coordinate: {
        lat: coordinates.coords.latitude,
        lng: coordinates.coords.longitude,
      },
      zoom: 15,
    });

    if (this.currentMarkerId) {
      this.map.removeMarker(this.currentMarkerId);
    }

    this.currentMarkerId = await this.map.addMarker({
      coordinate: {
        lat: coordinates.coords.latitude,
        lng: coordinates.coords.longitude,
      },
      title: 'Mi ubicación',
    });
  }
}