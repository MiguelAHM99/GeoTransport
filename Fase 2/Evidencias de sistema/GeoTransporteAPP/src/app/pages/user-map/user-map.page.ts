import { Component, OnInit } from '@angular/core';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';
import { Geolocation } from '@capacitor/geolocation';

@Component({
  selector: 'app-user-map',
  templateUrl: './user-map.page.html',
  styleUrls: ['./user-map.page.scss'],
})
export class UserMapPage implements OnInit {
  currentPosition: string = 'Esperando posición...';
  rutas: any[] = [];

  constructor(private firestore: Firestore) { }

  ngOnInit() {
    this.getRutas();
  }

  async getRutas() {
    const rutasRef = collection(this.firestore, 'Rutas');
    const querySnapshot = await getDocs(rutasRef);
    this.rutas = querySnapshot.docs.map(doc => doc.data());
  }

  printCurrentPosition = async () => {
    try {
      const coordinates = await Geolocation.getCurrentPosition();
      this.currentPosition = `Posición actual: Latitud: ${coordinates.coords.latitude}, Longitud: ${coordinates.coords.longitude}`;
    } catch (error) {
      console.error('Error obteniendo la posición:', error);
      this.currentPosition = 'No se pudo obtener la posición';
    }
  };
}