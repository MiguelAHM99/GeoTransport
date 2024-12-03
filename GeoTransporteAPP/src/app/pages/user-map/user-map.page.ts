import { Component, ElementRef, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Firestore, collection, getDocs, doc, getDoc } from '@angular/fire/firestore';
import { Geolocation } from '@capacitor/geolocation';
import { GoogleMap } from '@capacitor/google-maps';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-user-map',
  templateUrl: './user-map.page.html',
  styleUrls: ['./user-map.page.scss'],
})
export class UserMapPage implements OnInit, OnDestroy {

  @ViewChild('map') mapRef: ElementRef;
  map: GoogleMap;
  googleMapInstance: google.maps.Map; // Instancia de google.maps.Map

  currentPosition: string = 'Esperando posición...';
  currentMarker: google.maps.Marker | null = null;
  watchId: string | null = null; // Almacenar el ID del watcher
  services: any[] = [];
  selectedService: string = '';
  rutas: any[] = [];
  selectedRuta: string = '';
  paraderoMarkers: google.maps.Marker[] = [];
  conductorMarkers: google.maps.Marker[] = [];

  constructor(private readonly firestore: Firestore) { }

  ionViewDidEnter() {
    this.loadGoogleMaps().then(() => {
      this.createMap();
      this.startPositionUpdates(); // Iniciar la actualización de la posición
    });
  }

  async ngOnInit() {
    await this.getServices();
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
      // Estilo personalizado para el mapa (puedes modificarlo según tu preferencia)
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
      icon: 'assets/icon/man.png', // Icono para la ubicación del usuario
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
    for (const marker of this.paraderoMarkers) {
      marker.setMap(null);
    }
    this.paraderoMarkers = [];

    // Marcar los paraderos en el mapa
    for (const paradero of paraderos) {
      const marker = new google.maps.Marker({
        position: { lat: paradero['lat'], lng: paradero['lng'] },
        map: this.googleMapInstance,
        title: paradero['nombre'] || 'Paradero',
        icon: 'assets/icon/bus-stop.png', // Icono para los paraderos
      });
      this.paraderoMarkers.push(marker);

      // Añadir listener para mostrar el nombre del paradero
      marker.addListener('click', () => {
        const infoWindow = new google.maps.InfoWindow({
          content: paradero['nombre'] || 'Paradero',
        });
        infoWindow.open(this.googleMapInstance, marker);
      });
    }

    // Obtener la ubicación de los conductores
    await this.getConductoresUbicacion(rutaId);
  }

  async getConductoresUbicacion(rutaId: string) {
    console.log(`Obteniendo ubicaciones de conductores para la ruta ID: ${rutaId}`);
    const usuariosRef = collection(this.firestore, `Servicios/${this.selectedService}/usuarios`);
    const querySnapshot = await getDocs(usuariosRef);
    const conductores = querySnapshot.docs.map(doc => doc.id);

    // Limpiar los marcadores de los conductores anteriores
    for (const marker of this.conductorMarkers) {
      marker.setMap(null);
    }
    this.conductorMarkers = [];

    for (const conductorId of conductores) {
      const ubicacionDocRef = doc(this.firestore, `Servicios/${this.selectedService}/usuarios/${conductorId}/ubicacion/ubicacion-actual`);
      const ubicacionDoc = await getDoc(ubicacionDocRef);
      if (ubicacionDoc.exists() && ubicacionDoc.data()['recorridoId'] === rutaId) {
        const ubicacion = ubicacionDoc.data();
        const marker = new google.maps.Marker({
          position: { lat: ubicacion['lat'], lng: ubicacion['lng'] },
          map: this.googleMapInstance,
          title: 'Conductor',
          icon: 'assets/icon/car.png', // Icono para los conductores
        });

        // Añadir listener para mostrar el nombre del vehículo
        marker.addListener('click', () => {
          const infoWindow = new google.maps.InfoWindow({
            content: `Vehículo: ${ubicacion['nombreVehiculo']}`,
          });
          infoWindow.open(this.googleMapInstance, marker);
        });

        this.conductorMarkers.push(marker);
      }
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
    console.log(`Actualizando posición: ${this.currentPosition}`);

    if (this.currentMarker) {
      this.currentMarker.setMap(null);
    }

    this.currentMarker = new google.maps.Marker({
      position: { lat: coordinates.coords.latitude, lng: coordinates.coords.longitude },
      map: this.googleMapInstance,
      title: 'Mi ubicación',
      icon: 'assets/icon/man.png',
    });

    // Actualizar la ubicación de los conductores
    if (this.selectedRuta) {
      this.getConductoresUbicacion(this.selectedRuta);
    }
  }

  async startPositionUpdates() {
    const watch = await Geolocation.watchPosition({}, (position, err) => {
      if (err) {
        console.log("Error en la geolocalización: ", err);
        return;
      }

      this.currentPosition = `Lat: ${position.coords.latitude}, Lon: ${position.coords.longitude}`;
      console.log("Posición actualizada: ", this.currentPosition);

      if (this.currentMarker) {
        this.currentMarker.setMap(null);
      }

      this.currentMarker = new google.maps.Marker({
        position: { lat: position.coords.latitude, lng: position.coords.longitude },
        map: this.googleMapInstance,
        title: 'Mi ubicación',
        icon: 'assets/icon/man.png', // URL del icono azul para la ubicación del usuario
      });

      // Actualizar la ubicación de los conductores si una ruta está seleccionada
      if (this.selectedRuta) {
        this.getConductoresUbicacion(this.selectedRuta);
      }
    });

    // Guardar el ID del watcher para detenerlo después si es necesario
    this.watchId = watch;
  }

  ngOnDestroy() {
    if (this.watchId) {
      Geolocation.clearWatch({ id: this.watchId });
      this.watchId = null;
    }
  }
}
