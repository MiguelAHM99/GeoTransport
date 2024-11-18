import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Firestore, doc, getDoc, setDoc, collection, getDocs, writeBatch, deleteDoc } from '@angular/fire/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { GoogleMap } from '@capacitor/google-maps';
import { environment } from 'src/environments/environment.prod';
import { RutaI } from 'src/app/models/rutas.models';
import { SelectedServiceService } from 'src/app/services/selected-service.service';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-admin-edit-rute',
  templateUrl: './admin-edit-rute.page.html',
  styleUrls: ['./admin-edit-rute.page.scss'],
})
export class AdminEditRutePage implements OnInit {

  @ViewChild('map') mapRef: ElementRef;
  map: GoogleMap;

  newRuta: RutaI = {
    id: '',
    nombre: '',
    descripcion: '',
    inicio: '',
    destino: ''
  };
  selectedServicio: string;
  rutaId: string | null = null;
  cargando: boolean = false;
  paraderos: any[] = [];
  markers: Map<string, string> = new Map(); // Map to store marker references

  constructor(
    private readonly firestore: Firestore,
    private readonly firestoreService: FirestoreService,
    private readonly alertController: AlertController,
    private readonly router: Router,
    private readonly selectedServiceService: SelectedServiceService,
    private readonly route: ActivatedRoute
  ) {
    this.rutaId = this.route.snapshot.paramMap.get('id');
    this.selectedServicio = this.selectedServiceService.getSelectedService();
    if (this.rutaId) {
      this.getRuta(this.rutaId);
    }
  }

  ngOnInit() {}

  ionViewDidEnter() {
    this.createMap();
  }

  // Crear el mapa de Google
  async createMap() {
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
      },
    });

    // Añadir listener para seleccionar paraderos
    this.map.setOnMapClickListener(async (event) => {
      const { latitude, longitude } = event;
      const paraderoId = doc(collection(this.firestore, 'dummy')).id; // Generar un ID genérico de Firebase
      const markerId = await this.map.addMarker({
        coordinate: {
          lat: latitude,
          lng: longitude,
        },
        title: 'Paradero',
      });
      this.paraderos.push({ id: paraderoId, markerId, lat: latitude, lng: longitude, nombre: 'Paradero' });
      this.markers.set(paraderoId, markerId); // Store the marker reference
    });
  }

  // Obtener los datos de la ruta desde Firestore
  async getRuta(id: string) {
    if (!this.selectedServicio) return;

    this.cargando = true;
    const rutaDocRef = doc(this.firestore, `Servicios/${this.selectedServicio}/rutas/${id}`);
    const docSnap = await getDoc(rutaDocRef);

    if (docSnap.exists()) {
      this.newRuta = docSnap.data() as RutaI;
      // Cargar paraderos existentes
      const paraderosSnapshot = await getDocs(collection(this.firestore, `Servicios/${this.selectedServicio}/rutas/${id}/paraderos`));
      this.paraderos = paraderosSnapshot.docs.map(doc => doc.data());
      // Añadir marcadores al mapa
      for (const paradero of this.paraderos) {
        const markerId = await this.map.addMarker({
          coordinate: {
            lat: paradero.lat,
            lng: paradero.lng,
          },
          title: 'Paradero',
        });
        this.markers.set(paradero.id, markerId); // Store the marker reference
      }
    } else {
      this.showAlert('Error', 'Ruta no encontrada.');
      this.router.navigate(['/admin-rute']);
    }
    this.cargando = false;
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

  // Guardar los datos de la ruta y los paraderos en Firestore
  async save() {
    if (!this.validateInputs()) return; // Si la validación falla, detener el guardado.

    this.cargando = true;
    const batch = writeBatch(this.firestore);

    if (this.rutaId) {
      const rutaDocRef = doc(this.firestore, `Servicios/${this.selectedServicio}/rutas/${this.rutaId}`);
      batch.update(rutaDocRef, { ...this.newRuta });
    } else {
      this.newRuta.id = this.firestoreService.createIdDoc();
      const rutaDocRef = doc(this.firestore, `Servicios/${this.selectedServicio}/rutas/${this.newRuta.id}`);
      batch.set(rutaDocRef, this.newRuta);
    }

    // Guardar los paraderos
    const paraderoPromises = this.paraderos.map(paradero => {
      const paraderoDocRef = doc(this.firestore, `Servicios/${this.selectedServicio}/rutas/${this.newRuta.id}/paraderos`, paradero.id);
      return setDoc(paraderoDocRef, paradero);
    });

    await Promise.all(paraderoPromises);

    try {
      await batch.commit();
      this.router.navigate(['/admin-rute'], { replaceUrl: true }); // Redirigir a la lista de rutas después de guardar
    } catch (error) {
      console.error('Error al guardar la ruta:', error);
      this.showAlert('Error', 'Hubo un error al guardar la ruta. Por favor, inténtelo de nuevo.');
    } finally {
      this.cargando = false;
    }
  }

  // Validar campos antes de guardar o editar
  validateInputs(): boolean {
    if (!this.newRuta.nombre || !this.newRuta.descripcion || !this.newRuta.inicio || !this.newRuta.destino) {
      this.showAlert('Error', 'Por favor completa todos los campos');
      return false;
    }
    return true;
  }

  // Quitar un paradero de la lista
  async removeParadero(index: number) {
    const paraderoId = this.paraderos[index].id;
    const markerId = this.markers.get(paraderoId);
    if (markerId) {
      await this.map.removeMarker(markerId); // Eliminar el marcador del mapa
      this.markers.delete(paraderoId); // Eliminar la referencia del marcador
    }
    // Eliminar el paradero de Firestore si ya estaba en la colección
    if (this.rutaId) {
      const paraderoDocRef = doc(this.firestore, `Servicios/${this.selectedServicio}/rutas/${this.rutaId}/paraderos/${paraderoId}`);
      await deleteDoc(paraderoDocRef);
    }
    this.paraderos.splice(index, 1); // Eliminar el paradero de la lista
  }
}