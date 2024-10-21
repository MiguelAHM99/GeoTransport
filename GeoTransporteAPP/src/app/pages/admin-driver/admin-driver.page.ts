import { Component, OnInit } from '@angular/core';
import { ConductorI } from 'src/app/common/models/conductores.models';
import { FirestoreService } from 'src/app/common/services/firestore.service';
import { AlertController } from '@ionic/angular';
import { Firestore, collection, query, where, getDocs, doc, getDoc, collectionGroup } from '@angular/fire/firestore';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { UsuarioI } from 'src/app/common/models/usuario.model';

@Component({
  selector: 'app-admin-driver',
  templateUrl: './admin-driver.page.html',
  styleUrls: ['./admin-driver.page.scss'],
})
export class AdminDriverPage implements OnInit {

  conductores: ConductorI[] = [];
  newConductor: ConductorI;
  cargando: boolean = false;
  conductor: ConductorI;
  socioId: string | null = null;
  showPassword: { [key: string]: boolean } = {}; // Controlar visibilidad de contraseñas

  constructor(
    private firestoreService: FirestoreService,
    private alertController: AlertController,
    private firestore: Firestore,
    private auth: Auth
  ) {
    this.initConductor();
  }

  ngOnInit() {
    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        const userDocRef = doc(this.firestore, `usuarios/${user.uid}`);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data() as UsuarioI;
          if (userData.socio) {
            this.socioId = user.uid;
            this.loadConductores();
          } else {
            this.socioId = null;
          }
        } else {
          this.socioId = null;
        }
      } else {
        this.socioId = null;
      }
    });
  }

  // Cargar la colección completa de conductores
  async loadConductores() {
    if (!this.socioId) return;

    const conductoresRef = collection(this.firestore, `usuarios/${this.socioId}/conductores`);
    const querySnapshot = await getDocs(conductoresRef);
    const conductoresIds = querySnapshot.docs.map(doc => doc.id);

    if (conductoresIds.length === 0) return;

    const usuariosRef = collection(this.firestore, 'usuarios');
    const q = query(usuariosRef, where('id', 'in', conductoresIds));
    const usuariosSnapshot = await getDocs(q);
    this.conductores = usuariosSnapshot.docs.map(doc => {
      const data = doc.data() as ConductorI;
      data.id = doc.id;
      return data;
    });
  }

  // Inicializar un nuevo conductor con ID único
  initConductor() {
    this.newConductor = {
      correo: '',
      contrasenna: '',
      socio: false,
      id: this.firestoreService.createIdDoc()
    };
  }

  // Validar campos antes de guardar o editar
  validateInputs(): boolean {
    if (!this.newConductor.correo || !this.newConductor.contrasenna) {
      this.showAlert('Error', 'Por favor completa todos los campos');
      return false;
    }
    return true;
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

  // Guardar el nuevo conductor en Firestore
  async save() {
    if (!this.validateInputs()) return; // Si la validación falla, detener el guardado.
    this.cargando = true;
    await this.firestoreService.createDocument(this.newConductor, 'usuarios', this.newConductor.id);
    this.cargando = false;

    this.initConductor(); // Reiniciar el conductor para los campos de entrada
    this.loadConductores(); // Recargar la lista de conductores
  }

  // Editar un conductor existente
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
            this.newConductor = conductor; // Asignar el conductor a editar
          }
        }
      ]
    });
    await alert.present();
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
            await this.firestoreService.deleteDocument('usuarios', conductor.id);
            this.cargando = false;
            this.loadConductores(); // Recargar la lista de conductores
          }
        }
      ]
    });
    await alert.present();
  }

  // Obtener un conductor por su UID (asegurarse de pasar un UID válido)
  getConductor(uid: string) {
    if (!uid) {
      console.error('El UID proporcionado es inválido');
      return;
    }

    this.firestoreService.getDocumentChanges<ConductorI>('usuarios', uid).subscribe(data => {
      console.log('getConductor -> ', data);
      if (data) {
        this.conductor = data;
      }
    });
  }

  // Método para validar si el formulario es válido
  isFormValid(): boolean {
    return !!this.newConductor.correo && !!this.newConductor.contrasenna;
  }

  // Método para alternar la visibilidad de la contraseña
  togglePasswordVisibility(conductorId: string) {
    this.showPassword[conductorId] = !this.showPassword[conductorId];
  }
}