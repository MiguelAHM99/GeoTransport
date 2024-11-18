import { Component, OnInit } from '@angular/core';
import { Firestore, collection, getDocs, query, orderBy } from '@angular/fire/firestore';
import { SelectedServiceService } from 'src/app/services/selected-service.service';

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
    private readonly selectedServiceService: SelectedServiceService
  ) {}

  ngOnInit() {
    this.selectedServicio = this.selectedServiceService.getSelectedService();
    this.loadHistorial();
  }

  async loadHistorial() {
    if (!this.selectedServicio) {
      console.error('No se ha seleccionado ningún servicio');
      return;
    }

    try {
      const historialSnapshot = await getDocs(query(
        collection(this.firestore, `Servicios/${this.selectedServicio}/historial`),
        orderBy('timestamp', 'desc')
      ));
      this.historial = historialSnapshot.docs.map(doc => doc.data());
      this.filteredHistorial = this.historial;
      console.log('Historial cargado:', this.historial);
    } catch (error) {
      console.error('Error al cargar el historial:', error);
    }
  }

  filterHistorial() {
    this.filteredHistorial = this.historial.filter(item => {
      return Object.values(item).some(val =>
        String(val).toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    });
  }
}