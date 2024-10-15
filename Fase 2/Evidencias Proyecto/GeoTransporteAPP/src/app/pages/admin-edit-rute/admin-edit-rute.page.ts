import { Component, OnInit } from '@angular/core';
import { RutaI } from 'src/app/common/models/rutas.models';
import { FirestoreService } from 'src/app/common/services/firestore.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

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
  
  constructor(
    private firestoreService: FirestoreService,
    private route: ActivatedRoute,
    private router: Router,
    private alertController: AlertController
  ) { 
    this.rutaId = this.route.snapshot.paramMap.get('id');
    if (this.rutaId) {
      this.getRuta(this.rutaId);
    }
   }

  ngOnInit() {
  }

  // Obtener una ruta por su ID
  getRuta(id: string) {
    this.firestoreService.getDocumentChanges<RutaI>('Rutas', id).subscribe(data => {
      if (data) {
        this.newRuta = data;
      }
    });
  }
  // Validar campos antes de guardar o editar
  validateInputs(): boolean {
    if (!this.newRuta.nombre || !this.newRuta.descripcion || !this.newRuta.inicio || !this.newRuta.destino) {
      this.showAlert('Error', 'Por favor completa todos los campos');
      return false;
    }
    return true;
  }

// Guardar los cambios o crear una nueva ruta
async save() {
  if (!this.validateInputs()) return; // Validar campos
  this.cargando = true;

  if (this.rutaId) {
    // Editar la ruta existente
    await this.firestoreService.updateDocument(this.newRuta, 'Rutas', this.rutaId);
  } else {
    // Crear una nueva ruta
    this.newRuta.id = this.firestoreService.createIdDoc();
    await this.firestoreService.createDocument(this.newRuta, 'Rutas', this.newRuta.id);
  }

  this.cargando = false;
  this.router.navigate(['/admin-rute']);
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
