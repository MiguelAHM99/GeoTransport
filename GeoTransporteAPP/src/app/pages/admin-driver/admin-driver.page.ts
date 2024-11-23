import { Component, OnInit } from '@angular/core';
import { ConductorI } from 'src/app/models/conductores.models';
import { FirestoreService } from 'src/app/services/firestore.service';
import { AlertController } from '@ionic/angular';
import { Firestore, collection, getDocs, doc, deleteDoc, query, where  } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { SelectedServiceService } from 'src/app/services/selected-service.service';

@Component({
  selector: 'app-admin-driver',
  templateUrl: './admin-driver.page.html',
  styleUrls: ['./admin-driver.page.scss'],
})
export class AdminDriverPage implements OnInit {

  conductores: ConductorI[] = [];
  cargando: boolean = false;
  selectedServicio: string;
  showPassword: { [key: string]: boolean } = {};

  constructor(
    private readonly firestoreService: FirestoreService,
    private readonly alertController: AlertController,
    private readonly firestore: Firestore,
    private readonly router: Router,
    private readonly selectedServiceService: SelectedServiceService
  ) { }

  ngOnInit() {
    const loggedUser = JSON.parse(localStorage.getItem('user') || 'null');
    if (loggedUser) {
      this.selectedServicio = loggedUser.selectedServicio;
      console.log('Usuario autenticado, servicio seleccionado:', this.selectedServicio);
      this.loadConductores();
    } else {
      // Redirigir al usuario a la página de login si no está autenticado
      console.log('Usuario no autenticado, redirigiendo a login');
      this.router.navigate(['/login']);
    }
  }

  // Cargar la colección completa de conductores
  async loadConductores() {
    if (!this.selectedServicio) return;

    this.cargando = true;
    console.log('Cargando conductores para el servicio:', this.selectedServicio);
    const conductoresRef = collection(this.firestore, `Servicios/${this.selectedServicio}/usuarios`);
    const q = query(conductoresRef, where('socio', '==', false));
    const querySnapshot = await getDocs(q);
    this.conductores = querySnapshot.docs.map(doc => {
      const data = doc.data() as ConductorI;
      data.id = doc.id;
      return data;
    });
    console.log('Conductores cargados:', this.conductores);
    this.cargando = false;
  }

  // Editar un conductor existente
  async edit(conductor: ConductorI) {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: `¿Estás seguro de que deseas editar al conductor: ${conductor.correo}?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Confirmar', handler: () => {} }
      ]
    });

    await alert.present();
    const { role } = await alert.onDidDismiss();

    // Si el usuario confirma la edición, navegamos a la página de edición
    if (role !== 'cancel') {
      console.log('Navegando a la edición del conductor:', conductor.id);
      this.router.navigate(['/admin-edit-driver', conductor.id]);
    }
  }

  // Eliminar un conductor existente
  async delete(conductor: ConductorI) {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: `¿Estás seguro de que deseas eliminar al conductor: ${conductor.correo}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Confirmar',
          handler: async () => {
            this.cargando = true;
            console.log('Eliminando conductor:', conductor.id);
            await deleteDoc(doc(this.firestore, `Servicios/${this.selectedServicio}/conductores/${conductor.id}`));
            this.cargando = false;
            this.loadConductores(); // Recargar la lista de conductores
          }
        }
      ]
    });
    await alert.present();
  }

  create() {
    console.log('Navegando a la creación de un nuevo conductor');
    this.router.navigate(['/admin-edit-driver']);
  }

  // Mostrar u ocultar la contraseña
  togglePasswordVisibility(conductorId: string) {
    this.showPassword[conductorId] = !this.showPassword[conductorId];
    console.log('Visibilidad de la contraseña para el conductor', conductorId, ':', this.showPassword[conductorId]);
  }
}