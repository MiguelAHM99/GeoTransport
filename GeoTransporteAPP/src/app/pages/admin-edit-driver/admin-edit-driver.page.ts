import { Component, OnInit } from '@angular/core';
import { ConductorI } from 'src/app/models/conductores.models';
import { VehiculoI } from 'src/app/models/vehiculos.models';
import { RutaI } from 'src/app/models/rutas.models';
import { FirestoreService } from 'src/app/services/firestore.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Firestore, doc, getDoc, setDoc, collection, getDocs, query, where, writeBatch } from '@angular/fire/firestore';
import { SelectedServiceService } from 'src/app/services/selected-service.service';

@Component({
  selector: 'app-admin-edit-driver',
  templateUrl: './admin-edit-driver.page.html',
  styleUrls: ['./admin-edit-driver.page.scss'],
})
export class AdminEditDriverPage implements OnInit {

  newConductor: ConductorI = {
    id: '',
    correo: '',
    contrasenna: '',
    socio: false
  };
  vehiculos: VehiculoI[] = [];
  rutas: RutaI[] = [];
  selectedVehiculos: string[] = [];
  selectedRutas: string[] = [];
  cargando: boolean = false;
  selectedServicio: string;
  conductorId: string | null = null;

  constructor(
    private readonly firestoreService: FirestoreService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly alertController: AlertController,
    private readonly firestore: Firestore,
    private readonly selectedServiceService: SelectedServiceService
  ) { 
    this.conductorId = this.route.snapshot.paramMap.get('id');
    this.selectedServicio = this.selectedServiceService.getSelectedService();
    if (this.conductorId) {
      this.getConductor(this.conductorId);
    }
    this.loadVehiculos();
    this.loadRutas();
  }

  ngOnInit() {}

  // Obtener los datos del conductor desde Firestore
  async getConductor(id: string) {
    if (!this.selectedServicio) return;

    this.cargando = true;
    const conductorDocRef = doc(this.firestore, `Servicios/${this.selectedServicio}/usuarios/${id}`);
    const docSnap = await getDoc(conductorDocRef);

    if (docSnap.exists()) {
      this.newConductor = docSnap.data() as ConductorI;
      // Cargar los vehículos asignados al conductor
      const vehiculosRef = collection(this.firestore, `Servicios/${this.selectedServicio}/usuarios/${id}/vehiculos`);
      const vehiculosSnapshot = await getDocs(vehiculosRef);
      this.selectedVehiculos = vehiculosSnapshot.docs.map(doc => doc.id);
      // Cargar las rutas asignadas al conductor
      const rutasRef = collection(this.firestore, `Servicios/${this.selectedServicio}/usuarios/${id}/rutas`);
      const rutasSnapshot = await getDocs(rutasRef);
      this.selectedRutas = rutasSnapshot.docs.map(doc => doc.id);
    } else {
      this.showAlert('Error', 'Conductor no encontrado.');
      this.router.navigate(['/admin-driver']);
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

  // Guardar los datos del conductor en Firestore
  async save() {
    if (!this.isFormValid()) return; // Si la validación falla, detener el guardado.

    // Verificar si ya existe un conductor con el mismo correo en cualquier servicio
    const serviciosSnapshot = await getDocs(collection(this.firestore, 'Servicios'));
    for (const servicioDoc of serviciosSnapshot.docs) {
      const servicioId = servicioDoc.id;
      const conductoresRef = collection(this.firestore, `Servicios/${servicioId}/usuarios`);
      const q = query(conductoresRef, where('correo', '==', this.newConductor.correo));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty && (!this.conductorId || querySnapshot.docs[0].id !== this.conductorId)) {
        this.showAlert('Error', 'Ya existe un conductor con este correo en otro servicio.');
        return;
      }
    }


    this.cargando = true;
    const batch = writeBatch(this.firestore);

    if (this.conductorId) {
      const conductorDocRef = doc(this.firestore, `Servicios/${this.selectedServicio}/usuarios`, this.conductorId);
      batch.set(conductorDocRef, this.newConductor);

      // Actualizar la subcolección de vehículos
      const vehiculosRef = collection(this.firestore, `Servicios/${this.selectedServicio}/usuarios/${this.conductorId}/vehiculos`);
      const vehiculosSnapshot = await getDocs(vehiculosRef);
      vehiculosSnapshot.docs.forEach(doc => batch.delete(doc.ref));

      const vehiculoPromises = this.selectedVehiculos.map(async vehiculoId => {
        const vehiculoDocRef = doc(this.firestore, `Servicios/${this.selectedServicio}/vehiculos`, vehiculoId);
        const vehiculoDoc = await getDoc(vehiculoDocRef);
        if (vehiculoDoc.exists()) {
          const vehiculoData = vehiculoDoc.data() as VehiculoI;
          const vehiculoToSave = {
            id: vehiculoData.id,
            nombre: vehiculoData.nombre,
            patente: vehiculoData.patente
          };
          const vehiculoSubDocRef = doc(this.firestore, `Servicios/${this.selectedServicio}/usuarios/${this.conductorId}/vehiculos`, vehiculoId);
          batch.set(vehiculoSubDocRef, vehiculoToSave);
        }
      });

      // Actualizar la subcolección de rutas
      const rutasRef = collection(this.firestore, `Servicios/${this.selectedServicio}/usuarios/${this.conductorId}/rutas`);
      const rutasSnapshot = await getDocs(rutasRef);
      rutasSnapshot.docs.forEach(doc => batch.delete(doc.ref));

      const rutaPromises = this.selectedRutas.map(async rutaId => {
        const rutaDocRef = doc(this.firestore, `Servicios/${this.selectedServicio}/rutas`, rutaId);
        const rutaDoc = await getDoc(rutaDocRef);
        if (rutaDoc.exists()) {
          const rutaData = rutaDoc.data() as RutaI;
          const rutaToSave = {
            id: rutaData.id,
            nombre: rutaData.nombre,
            descripcion: rutaData.descripcion,
            inicio: rutaData.inicio,
            destino: rutaData.destino
          };
          const rutaSubDocRef = doc(this.firestore, `Servicios/${this.selectedServicio}/usuarios/${this.conductorId}/rutas`, rutaId);
          batch.set(rutaSubDocRef, rutaToSave);
        }
      });

      await Promise.all([...vehiculoPromises, ...rutaPromises]);
    } else {
      this.newConductor.id = this.firestoreService.createIdDoc();
      const conductorDocRef = doc(this.firestore, `Servicios/${this.selectedServicio}/usuarios`, this.newConductor.id);
      batch.set(conductorDocRef, this.newConductor);
      //El conductor almacena todos los datos de las tablas, pero solo utiliza el ID para consultar la tabla general del servicio

    // Crear la subcolección de vehículos
    const vehiculoPromises = this.selectedVehiculos.map(async vehiculoId => {
      const vehiculoDocRef = doc(this.firestore, `Servicios/${this.selectedServicio}/vehiculos`, vehiculoId);
      const vehiculoDoc = await getDoc(vehiculoDocRef);
      if (vehiculoDoc.exists()) {
        const vehiculoData = vehiculoDoc.data() as VehiculoI;
        const vehiculoToSave = {
          id: vehiculoData.id,
          nombre: vehiculoData.nombre,
          patente: vehiculoData.patente
        };
        const vehiculoSubDocRef = doc(this.firestore, `Servicios/${this.selectedServicio}/usuarios/${this.newConductor.id}/vehiculos`, vehiculoId);
        batch.set(vehiculoSubDocRef, vehiculoToSave);
      }
    });

    // Crear la subcolección de rutas
    const rutaPromises = this.selectedRutas.map(async rutaId => {
      const rutaDocRef = doc(this.firestore, `Servicios/${this.selectedServicio}/rutas`, rutaId);
      const rutaDoc = await getDoc(rutaDocRef);
      if (rutaDoc.exists()) {
        const rutaData = rutaDoc.data() as RutaI;
        const rutaToSave = {
          id: rutaData.id,
          nombre: rutaData.nombre,
          descripcion: rutaData.descripcion,
          inicio: rutaData.inicio,
          destino: rutaData.destino
        };
        const rutaSubDocRef = doc(this.firestore, `Servicios/${this.selectedServicio}/usuarios/${this.newConductor.id}/rutas`, rutaId);
        batch.set(rutaSubDocRef, rutaToSave);
      }
    });

    await Promise.all([...vehiculoPromises, ...rutaPromises]);

    try {
      await batch.commit();
      this.router.navigate(['/admin-panel']);
    } catch (error) {
      console.error('Error al guardar el conductor:', error);
      this.showAlert('Error', 'Hubo un error al guardar el conductor. Por favor, inténtelo de nuevo.');
    } finally {
      this.cargando = false;
    }
  }


    await batch.commit();
    this.cargando = false;
    this.router.navigate(['/admin-driver']); // Redirigir a la lista de conductores después de guardar
  }

  // Cargar la lista de vehículos
  async loadVehiculos() {
    if (!this.selectedServicio) return;

    const vehiculosRef = collection(this.firestore, `Servicios/${this.selectedServicio}/vehiculos`);
    const querySnapshot = await getDocs(vehiculosRef);
    this.vehiculos = querySnapshot.docs.map(doc => {
      const data = doc.data() as VehiculoI;
      data.id = doc.id;
      return data;
    });
  }

  // Cargar la lista de rutas
  async loadRutas() {
    if (!this.selectedServicio) return;

    const rutasRef = collection(this.firestore, `Servicios/${this.selectedServicio}/rutas`);
    const querySnapshot = await getDocs(rutasRef);
    this.rutas = querySnapshot.docs.map(doc => {
      const data = doc.data() as RutaI;
      data.id = doc.id;
      return data;
    });
  }

  // Validar si el formulario es válido
  isFormValid(): boolean {
    return !!this.newConductor.correo && !!this.newConductor.contrasenna;
  }
}