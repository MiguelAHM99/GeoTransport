import { Component, OnInit } from '@angular/core';
import { ConductorI } from 'src/app/common/models/conductores.models';
import { FirestoreService } from 'src/app/common/services/firestore.service';
import { AlertController } from '@ionic/angular';
import { Firestore, collection, getDocs, doc, deleteDoc, setDoc, query, where } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { SelectedServiceService } from 'src/app/services/selected-service.service';

@Component({
  selector: 'app-admin-driver',
  templateUrl: './admin-driver.page.html',
  styleUrls: ['./admin-driver.page.scss'],
})
export class AdminDriverPage implements OnInit {

  conductores: ConductorI[] = [];
  newConductor: ConductorI = {
    id: '',
    correo: '',
    contrasenna: '',
    socio: false
  };
  cargando: boolean = false;
  selectedServicio: string;
  showPassword: { [key: string]: boolean } = {};

  constructor(
    private firestoreService: FirestoreService,
    private alertController: AlertController,
    private firestore: Firestore,
    private router: Router,
    private selectedServiceService: SelectedServiceService
  ) { }

  ngOnInit() {
    this.selectedServicio = this.selectedServiceService.getSelectedService();
    this.loadConductores();
  }

  // Cargar la colección completa de conductores
  async loadConductores() {
    if (!this.selectedServicio) return;

    this.cargando = true;
    const conductoresRef = collection(this.firestore, `Servicios/${this.selectedServicio}/usuarios`);
    const q = query(conductoresRef, where('socio', '==', false));
    const querySnapshot = await getDocs(q);
    this.conductores = querySnapshot.docs.map(doc => {
      const data = doc.data() as ConductorI;
      data.id = doc.id;
      return data;
    });
    this.cargando = false;
  }

  // Guardar el nuevo conductor en Firestore
  async save() {
    if (!this.isFormValid()) return; // Si la validación falla, detener el guardado.
    
    // Verificar si ya existe un conductor con el mismo correo
    const conductoresRef = collection(this.firestore, `Servicios/${this.selectedServicio}/usuarios`);
    const q = query(conductoresRef, where('correo', '==', this.newConductor.correo));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      this.showAlert('Error', 'Ya existe un conductor con este correo.');
      return;
    }

    this.cargando = true;
    this.newConductor.id = this.firestoreService.createIdDoc();
    await setDoc(doc(this.firestore, `Servicios/${this.selectedServicio}/usuarios`, this.newConductor.id), this.newConductor);
    this.cargando = false;

    this.newConductor = { id: '', correo: '', contrasenna: '' ,socio: false}; // Reiniciar el conductor para los campos de entrada
    this.loadConductores(); // Recargar la lista de conductores
  }

  // Eliminar un conductor existente
  async delete(conductor: ConductorI) {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: `¿Estás seguro de que deseas eliminar el conductor: ${conductor.correo}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Confirmar',
          handler: async () => {
            this.cargando = true;
            await deleteDoc(doc(this.firestore, `Servicios/${this.selectedServicio}/usuarios`, conductor.id));
            this.cargando = false;
            this.loadConductores(); // Recargar la lista de conductores
          }
        }
      ]
    });
    await alert.present();
  }

  // Editar un conductor existente
  edit(conductor: ConductorI) {
    this.newConductor = { ...conductor };
  }

  // Método para validar si el formulario es válido
  isFormValid(): boolean {
    return !!this.newConductor.correo && !!this.newConductor.contrasenna;
  }

  // Método para alternar la visibilidad de la contraseña
  togglePasswordVisibility(conductorId: string) {
    this.showPassword[conductorId] = !this.showPassword[conductorId];
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
}