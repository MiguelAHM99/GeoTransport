import { Component, OnInit } from '@angular/core';
import { ConductorI } from 'src/app/models/conductores.models';
import { FirestoreService } from 'src/app/services/firestore.service';
import { AlertController } from '@ionic/angular';
import { Firestore, collection, getDocs, doc, deleteDoc, query, where } from '@angular/fire/firestore';
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

  // Confirmar edición de un conductor
  async edit(conductor: ConductorI) {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: `¿Estás seguro de que deseas editar el conductor: ${conductor.correo}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Confirmar',
          handler: () => {
            // Navegar a la página de edición si se confirma
            this.router.navigate(['/admin-edit-driver', conductor.id]);
          }
        }
      ]
    });
    await alert.present();
  }

  // Navegar a la página de creación de conductores
  create() {
    this.router.navigate(['/admin-edit-driver']);
  }

  // Método para alternar la visibilidad de la contraseña
  togglePasswordVisibility(conductorId: string) {
    this.showPassword[conductorId] = !this.showPassword[conductorId];
  }
}
