import { Component, OnInit } from '@angular/core';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';

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

  constructor(private firestore: Firestore) {}

  ngOnInit() {
    this.getRutas();
    this.getVehiculos();
  }

  async getRutas() {
    const rutasRef = collection(this.firestore, 'Rutas');
    const querySnapshot = await getDocs(rutasRef);
    this.rutas = querySnapshot.docs.map(doc => doc.data());
  }

  async getVehiculos() {
    const vehiculosRef = collection(this.firestore, 'Vehiculos');
    const querySnapshot = await getDocs(vehiculosRef);
    this.vehiculos = querySnapshot.docs.map(doc => doc.data());
  }
}