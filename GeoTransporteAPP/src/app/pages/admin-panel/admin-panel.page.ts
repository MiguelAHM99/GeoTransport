import { Component, OnInit } from '@angular/core';
import { Firestore, collection, getDocs, query, orderBy } from '@angular/fire/firestore';
import { SelectedServiceService } from 'src/app/services/selected-service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.page.html',
  styleUrls: ['./admin-panel.page.scss'],
})
export class AdminPanelPage implements OnInit {
  historial: any[] = [];
  filteredHistorial: any[] = [];
  selectedServicio: string;
  searchTerm: string = '';

  constructor(
    private readonly firestore: Firestore,
    private readonly selectedServiceService: SelectedServiceService,
    private readonly router: Router
  ) {}

  ngOnInit() {
    const loggedUser = JSON.parse(localStorage.getItem('user') || 'null');
    if (loggedUser) {
      this.selectedServicio = loggedUser.selectedServicio;
      console.log('Usuario autenticado, servicio seleccionado:', this.selectedServicio);
      this.loadHistorial();
    } else {
      // Redirigir al usuario a la página de login si no está autenticado
      console.log('Usuario no autenticado, redirigiendo a login');
      this.router.navigate(['/login']);
    }
  }

  async loadHistorial() {
    if (!this.selectedServicio) {
      console.error('No se ha seleccionado ningún servicio');
      return;
    }

    try {
      const historialRef = collection(this.firestore, `Servicios/${this.selectedServicio}/historial`);
      const q = query(historialRef, orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      this.historial = querySnapshot.docs.map(doc => doc.data());
      this.filteredHistorial = this.historial;
      console.log('Historial cargado:', this.historial);
    } catch (error) {
      console.error('Error al cargar el historial:', error);
    }
  }

  filterHistorial() {
    this.filteredHistorial = this.historial.filter(item => 
      item.conductor.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}