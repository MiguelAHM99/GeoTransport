import { Component, OnInit } from '@angular/core';
import { RutaI } from 'src/app/common/models/rutas.models';
import { FirestoreService } from 'src/app/common/services/firestore.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { SelectedServiceService } from 'src/app/services/selected-service.service';

@Component({
  selector: 'app-admin-edit-rute',
  templateUrl: './admin-edit-rute.page.html',
  styleUrls: ['./admin-edit-rute.page.scss'],
})
export class AdminEditRutePage implements OnInit {

  newRuta: RutaI = {
    id: '',
    nombre: '',
    descripcion: '',
    inicio: '',
    destino: ''
  };
  cargando: boolean = false;
  rutaId: string | null = null;
  selectedServicio: string;

  constructor(
    private firestoreService: FirestoreService,
    private route: ActivatedRoute,
    private router: Router,
    private alertController: AlertController,
    private firestore: Firestore,
    private selectedServiceService: SelectedServiceService
  ) { 
    this.rutaId = this.route.snapshot.paramMap.get('id');
    this.selectedServicio = this.selectedServiceService.getSelectedService();
    if (this.rutaId) {
      this.getRuta(this.rutaId);
    }
  }

  ngOnInit() {}

  // Obtener los datos de la ruta desde Firestore
  async getRuta(id: string) {
    if (!this.selectedServicio) return;

    this.cargando = true;
    const rutaDocRef = doc(this.firestore, `Servicios/${this.selectedServicio}/rutas/${id}`);
    const docSnap = await getDoc(rutaDocRef);

    if (docSnap.exists()) {
      this.newRuta = docSnap.data() as RutaI;
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

  // Guardar los datos de la ruta en Firestore
  async save() {
    if (!this.validateInputs()) return; // Si la validación falla, detener el guardado.
    this.cargando = true;
    if (this.rutaId) {
      await setDoc(doc(this.firestore, `Servicios/${this.selectedServicio}/rutas`, this.rutaId), this.newRuta);
    } else {
      this.newRuta.id = this.firestoreService.createIdDoc();
      await setDoc(doc(this.firestore, `Servicios/${this.selectedServicio}/rutas`, this.newRuta.id), this.newRuta);
    }
    this.cargando = false;
    this.router.navigate(['/admin-rute'], { replaceUrl: true }); // Redirigir a la lista de rutas después de guardar
  }

  // Validar campos antes de guardar o editar
  validateInputs(): boolean {
    if (!this.newRuta.nombre || !this.newRuta.descripcion || !this.newRuta.inicio || !this.newRuta.destino) {
      this.showAlert('Error', 'Por favor completa todos los campos');
      return false;
    }
    return true;
  }
}