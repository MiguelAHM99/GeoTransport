import { Component, OnInit } from '@angular/core';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';

@Component({
  selector: 'app-user-map',
  templateUrl: './user-map.page.html',
  styleUrls: ['./user-map.page.scss'],
})
export class UserMapPage implements OnInit {
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
}