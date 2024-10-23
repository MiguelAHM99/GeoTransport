import { Component, OnInit } from '@angular/core';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';
import { SelectedServiceService } from 'src/app/services/selected-service.service';

@Component({
  selector: 'app-driver-map',
  templateUrl: './driver-map.page.html',
  styleUrls: ['./driver-map.page.scss'],
})
export class DriverMapPage implements OnInit {
  rutas: any[] = [];
  vehiculos: any[] = [];
  selectedRuta: string;
  selectedVehiculo: string;
  serviceId: string;

  constructor(
    private firestore: Firestore,
    private selectedServiceService: SelectedServiceService
  ) {}

  ngOnInit() {
    console.log('DriverMapPage inicializado');
    this.serviceId = this.selectedServiceService.getSelectedService();
    console.log(`ID del servicio obtenido: ${this.serviceId}`);
    this.getRutas();
    this.getVehiculos();
  }

  async getRutas() {
    try {
      console.log(`Obteniendo rutas para el ID del servicio: ${this.serviceId}`);
      const rutasRef = collection(this.firestore, `Servicios/${this.serviceId}/rutas`);
      const querySnapshot = await getDocs(rutasRef);
      console.log('Instantánea de consulta de rutas:', querySnapshot);
      console.log('Número de documentos de rutas:', querySnapshot.size);
      this.rutas = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log(`Datos del documento de ruta para el ID ${doc.id}:`, data);
        return { id: doc.id, ...data };
      });
      console.log('Rutas obtenidas:', this.rutas);
    } catch (error) {
      console.error('Error obteniendo rutas:', error);
    }
  }

  async getVehiculos() {
    try {
      console.log(`Obteniendo vehículos para el ID del servicio: ${this.serviceId}`);
      const vehiculosRef = collection(this.firestore, `Servicios/${this.serviceId}/vehiculos`);
      const querySnapshot = await getDocs(vehiculosRef);
      console.log('Instantánea de consulta de vehículos:', querySnapshot);
      console.log('Número de documentos de vehículos:', querySnapshot.size);
      this.vehiculos = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log(`Datos del documento de vehículo para el ID ${doc.id}:`, data);
        return { id: doc.id, ...data };
      });
      console.log('Vehículos obtenidos:', this.vehiculos);
    } catch (error) {
      console.error('Error obteniendo vehículos:', error);
    }
  }
}