import { Injectable } from '@angular/core';
import { Firestore, enableIndexedDbPersistence } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class FirestorePersistenceService {
  private persistenceEnabled = false;

  constructor(private readonly firestore: Firestore) {}

  enablePersistence() {
    if (!this.persistenceEnabled) {
      enableIndexedDbPersistence(this.firestore)
        .then(() => {
          console.log('Persistencia de Firestore habilitada');
          this.persistenceEnabled = true;
        })
        .catch((err) => {
          if (err.code === 'failed-precondition') {
            console.error(
              'No se pudo habilitar la persistencia de Firestore debido a múltiples pestañas abiertas.'
            );
          } else if (err.code === 'unimplemented') {
            console.error(
              'La persistencia de Firestore no es soportada en este navegador.'
            );
          }
        });
    }
  }
}
