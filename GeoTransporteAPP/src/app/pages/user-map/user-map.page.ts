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
  watchId: string | null = null;
  services: any[] = [];
  selectedService: string = '';
  rutas: any[] = [];

  constructor(private firestore: Firestore) { }

  ionViewDidEnter(){
    this.createMap();
  }

  UbicacionActual = async () => {
    this.watchId = await Geolocation.watchPosition({}, async (position, err) => {
      if (err) {
        console.error('Error actualizando la posición:', err);
        this.currentPosition = 'Error actualizando la posición';
        return;
      }

      if (position) {
        const { latitude, longitude } = position.coords;
        this.currentPosition = `Posición actual: Latitud: ${latitude}, Longitud: ${longitude}`;
        console.log('Posición actual:', this.currentPosition);

        await this.map.setCamera({
          coordinate: {
            lat: latitude,
            lng: longitude,
          },
          zoom: 14,
        });

        if (this.currentMarkerId) {
          await this.map.removeMarker(this.currentMarkerId);
        }

        this.currentMarkerId = await this.map.addMarker({
          coordinate: {
            lat: latitude,
            lng: longitude,
          },
          title: 'Ubicación Actual',
          snippet: 'Ubicación actualizada',
        });
      }
    });
  };

  async createMap() {
    try {
      this.map = await GoogleMap.create({
        id: 'my-map',
        apiKey: environment.mapsKey,
        element: this.mapRef.nativeElement,
        config: {
          center: {
            lat: -33.036,
            lng: -71.62963,
          },
          zoom: 8,
        },
      });
      
      this.UbicacionActual();
      
    } catch (error) {
      console.error('Error creando el mapa:', error);
    }
  }

  ngOnInit() {
    this.getServices();
  }

  ngOnDestroy() {
    if (this.watchId) {
      Geolocation.clearWatch({ id: this.watchId });
    }
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

    this.addMarkers();
  }

  async addMarkers() {
    if (!this.rutas || !this.map) return;

    for (const ruta of this.rutas) {
      if (ruta.latitud && ruta.longitud) { 
        await this.map.addMarker({
          coordinate: {
            lat: ruta.latitud,
            lng: ruta.longitud,
          },
          title: ruta.nombre || 'Punto de ruta',
          snippet: ruta.descripcion || '',
        });
      }
    }
  }

  onServiceChange(serviceId: string) {
    console.log(`Servicio seleccionado: ${serviceId}`);
    this.selectedService = serviceId;
    this.getRutas(serviceId);
  }
}
