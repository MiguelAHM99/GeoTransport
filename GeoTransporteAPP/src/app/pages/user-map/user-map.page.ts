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
  googleMapInstance: google.maps.Map;

  currentPosition: string = 'Esperando posición...';
  currentMarker: google.maps.Marker | null = null;
  watchId: string | null = null; // Para almacenar el ID del watcher
  services: any[] = [];
  selectedService: string = '';
  rutas: any[] = [];
  selectedRuta: string = '';
  paraderoMarkers: google.maps.Marker[] = [];

  constructor(private readonly firestore: Firestore) { }

  ionViewDidEnter() {
    this.createMap(); // Crear el mapa al entrar en la vista
  }

  ionViewDidLeave() {
    // Detener el seguimiento al salir de la vista
    if (this.watchId) {
      Geolocation.clearWatch({ id: this.watchId });
      this.watchId = null;
    }
  }

  async ngOnInit() {
    await this.getServices(); // Cargar los servicios disponibles
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

    // Crear el mapa con configuraciones predeterminadas
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

    // Llamar a la función para establecer la ubicación inicial
    await this.setInitialLocation();

    // Iniciar el seguimiento de ubicación
    this.startWatchingPosition();
  }

  async setInitialLocation() {
    try {
      const coordinates = await Geolocation.getCurrentPosition();
      const { latitude, longitude } = coordinates.coords;

      // Actualizar la posición actual
      this.currentPosition = `Lat: ${latitude}, Lon: ${longitude}`;

      // Centrar el mapa en la ubicación del usuario
      this.googleMapInstance.setCenter({ lat: latitude, lng: longitude });
      this.googleMapInstance.setZoom(15);

      // Crear un marcador en la ubicación actual
      this.updateMarker(latitude, longitude);
    } catch (error) {
      console.error('Error al obtener la ubicación inicial:', error);
    }
  }

  startWatchingPosition() {
    Geolocation.watchPosition(
      {enableHighAccuracy: true},
      (position, err) => {
        if (err) {
          console.error('Error al rastrear posición:', err);
          return;
        }
        if (position) {
          const { latitude, longitude } = position.coords;
  
          // Actualizar la posición actual
          this.currentPosition = `Lat: ${latitude}, Lon: ${longitude}`;
  
          // Actualizar el marcador y centrar el mapa en la nueva posición
          this.updateMarker(latitude, longitude);
        }
      }
    ).then(watchId => {
      this.watchId = watchId; // Asignar el ID del watcher
    });
  }
  updateMarker(latitude: number, longitude: number) {
    throw new Error('Method not implemented.');
  }

  async getServices() {
    const servicesRef = collection(this.firestore, 'Servicios');
    const querySnapshot = await getDocs(servicesRef);
    this.services = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async getRutas(serviceId: string) {
    const rutasRef = collection(this.firestore, `Servicios/${serviceId}/rutas`);
    const querySnapshot = await getDocs(rutasRef);
    this.rutas = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async getParaderos(rutaId: string) {
    const paraderosRef = collection(this.firestore, `Servicios/${this.selectedService}/rutas/${rutaId}/paraderos`);
    const querySnapshot = await getDocs(paraderosRef);
    const paraderos = querySnapshot.docs.map(doc => doc.data());

    for (const marker of this.paraderoMarkers) {
      marker.setMap(null);
    }
    this.paraderoMarkers = [];

    for (const paradero of paraderos) {
      const marker = new google.maps.Marker({
        position: { lat: paradero['lat'], lng: paradero['lng'] },
        map: this.googleMapInstance,
        title: paradero['nombre'] || 'Paradero',
        icon: 'assets/icon/bus-stop.png',
      });
      this.paraderoMarkers.push(marker);

      marker.addListener('click', () => {
        const infoWindow = new google.maps.InfoWindow({
          content: paradero['nombre'] || 'Paradero',
        });
        infoWindow.open(this.googleMapInstance, marker);
      });
    }
  }

  onServiceChange(serviceId: string) {
    this.selectedService = serviceId;
    this.getRutas(serviceId);
  }

  onRutaChange(rutaId: string) {
    this.selectedRuta = rutaId;
    this.getParaderos(rutaId);
  }
}

