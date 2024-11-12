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

  constructor(private firestore: Firestore) { }

  ionViewDidEnter(){
    this.createMap();
  }

  // Método para iniciar la vigilancia de la ubicación
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

        // Centrar el mapa en la nueva posición
        await this.map.setCamera({
          coordinate: {
            lat: latitude,
            lng: longitude,
          },
          zoom: 14,
        });

        // Actualizar o añadir el marcador en la nueva ubicación
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

  // Crear el mapa y comenzar a observar la posición
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
      
      // Inicia el seguimiento de la posición del usuario
      this.UbicacionActual();
      
    } catch (error) {
      console.error('Error creando el mapa:', error);
    }
  }

  ngOnInit() {
    this.getServices();
  }

  ngOnDestroy() {
    // Detener la vigilancia de la posición cuando se destruya el componente
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
  }

  onServiceChange(serviceId: string) {
    console.log(`Servicio seleccionado: ${serviceId}`);
    this.selectedService = serviceId;
    this.getRutas(serviceId);
  }
}

