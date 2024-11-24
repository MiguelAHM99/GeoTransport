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
  @ViewChild('map', { static: false }) mapRef!: ElementRef;
  map!: GoogleMap;
  currentPosition: string = 'Esperando posición...';
  currentMarker: any = null;
  watchId: string | null = null;
  services: any[] = [];
  selectedService: string = '';
  rutas: any[] = [];
  selectedRuta: string = '';
  paraderoMarkers: any[] = [];

  constructor(private readonly firestore: Firestore) {}

  // Inicializa datos al cargar el componente
  async ngOnInit() {
    await this.getServices(); // Obtiene la lista de servicios
  }

  // Crea el mapa al entrar en la vista
  async ionViewDidEnter() {
    await this.createMap();
  }

  // Limpia recursos al salir de la vista
  ionViewDidLeave() {
    if (this.watchId) {
      Geolocation.clearWatch({ id: this.watchId });
      this.watchId = null;
    }
  }

  // Crea el mapa con la configuración deseada
  async createMap() {
    const mapStyles = [
      { featureType: 'poi', elementType: 'all', stylers: [{ visibility: 'off' }] },
      { featureType: 'transit', elementType: 'all', stylers: [{ visibility: 'off' }] },
      { featureType: 'road', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
      { featureType: 'administrative', elementType: 'labels', stylers: [{ visibility: 'off' }] },
      { featureType: 'landscape', elementType: 'labels', stylers: [{ visibility: 'off' }] },
      { featureType: 'administrative.locality', elementType: 'labels.text', stylers: [{ visibility: 'on' }] },
    ];

    this.map = await GoogleMap.create({
      id: 'my-map', // Identificador único para el mapa
      element: this.mapRef.nativeElement, // Elemento del DOM donde se renderizará el mapa
      apiKey: environment.mapsKey, // Clave de la API de Google Maps
      config: {
        center: { lat: -33.036, lng: -71.62963 }, // Coordenadas iniciales
        zoom: 8, // Nivel de zoom inicial
        styles: mapStyles,
        streetViewControl: false,
      },
    });

    await this.setInitialLocation(); // Centra el mapa en la posición inicial
    this.startWatchingPosition(); // Inicia el seguimiento de ubicación
  }

  // Establece la ubicación inicial del usuario
  async setInitialLocation() {
    try {
      const coordinates = await Geolocation.getCurrentPosition();
      const { latitude, longitude } = coordinates.coords;
  
      this.currentPosition = `Lat: ${latitude}, Lon: ${longitude}`;
      await this.map.setCamera({
        coordinate: { lat: latitude, lng: longitude }, // Cambiar nombres de propiedades
        zoom: 15,
      });
  
      this.updateMarker(latitude, longitude); // Actualiza o crea el marcador
    } catch (error) {
      console.error('Error al obtener la ubicación inicial:', error);
    }
  }

  // Inicia el seguimiento continuo de la posición del usuario
  startWatchingPosition() {
    Geolocation.watchPosition(
      { enableHighAccuracy: true },
      (position, err) => {
        if (err) {
          console.error('Error al rastrear posición:', err);
          return;
        }

        if (position) {
          const { latitude, longitude } = position.coords;

          this.currentPosition = `Lat: ${latitude}, Lon: ${longitude}`;
          this.updateMarker(latitude, longitude); // Actualiza el marcador en tiempo real
        }
      }
    ).then(watchId => {
      this.watchId = watchId;
    });
  }

  // Agrega o actualiza el marcador en el mapa
  async updateMarker(lat: number, lng: number) {
    if (this.currentMarker) {
      await this.currentMarker.setPosition({ lat, lng });
    } else {
      this.currentMarker = await this.map.addMarker({
        coordinate: { lat, lng }, // Cambiar nombres de propiedades
        title: 'Mi ubicación actual',
      });
    }
  }

  // Obtiene la lista de servicios desde Firestore
  async getServices() {
    const servicesRef = collection(this.firestore, 'Servicios');
    const querySnapshot = await getDocs(servicesRef);
    this.services = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  // Obtiene las rutas de un servicio seleccionado
  async getRutas(serviceId: string) {
    const rutasRef = collection(this.firestore, `Servicios/${serviceId}/rutas`);
    const querySnapshot = await getDocs(rutasRef);
    this.rutas = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  // Obtiene los paraderos de una ruta seleccionada
  async getParaderos(rutaId: string) {
    const paraderosRef = collection(this.firestore, `Servicios/${this.selectedService}/rutas/${rutaId}/paraderos`);
    const querySnapshot = await getDocs(paraderosRef);
    const paraderos = querySnapshot.docs.map(doc => doc.data());
  
    // Limpia los marcadores existentes
    for (const marker of this.paraderoMarkers) {
      marker.remove();
    }
    this.paraderoMarkers = [];
  
    // Agrega nuevos marcadores
    for (const paradero of paraderos) {
      const marker = await this.map.addMarker({
        coordinate: { lat: paradero['lat'], lng: paradero['lng'] }, // Cambiar nombres de propiedades
        title: paradero['nombre'] || 'Paradero',
        iconUrl: 'assets/icon/bus-stop.png',
      });
      this.paraderoMarkers.push(marker);
    }
  }

  // Maneja el cambio de servicio
  onServiceChange(serviceId: string) {
    this.selectedService = serviceId;
    this.getRutas(serviceId);
  }

  // Maneja el cambio de ruta
  onRutaChange(rutaId: string) {
    this.selectedRuta = rutaId;
    this.getParaderos(rutaId);
  }
}
