import { inject, Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, getDoc, setDoc, updateDoc, deleteDoc, DocumentReference } from '@angular/fire/firestore';
import { v4 as uuidv4 } from 'uuid';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  firestore: Firestore = inject(Firestore);

  constructor() { }

  // Obtener un documento individual con ID
  getDocument<tipo>(enlace: string, documentId: string) {
    const documentRef = doc(this.firestore, `${enlace}/${documentId}`) as DocumentReference<tipo>;
    return getDoc(documentRef); // Este método es correcto para obtener un documento
  }

  // Obtener datos de un documento en tiempo real
  getDocumentChanges<tipo>(enlace: string, documentId: string): Observable<tipo> {
    const document = doc(this.firestore, `${enlace}/${documentId}`);
    return docData(document) as Observable<tipo>;
  }
  
  // Obtener una colección completa
  getCollectionChanges<tipo>(path: string): Observable<tipo[]> {
    const refCollection = collection(this.firestore, path);
    return collectionData(refCollection) as Observable<tipo[]>;
  }

  // Crear un documento nuevo
  createDocument(data: any, enlace: string, documentId: string) {
    const document = doc(this.firestore, `${enlace}/${documentId}`);
    return setDoc(document, data);
  }

  // Actualizar un documento
  updateDocument(data: any, enlace: string, documentId: string) {
    const document = doc(this.firestore, `${enlace}/${documentId}`);
    return updateDoc(document, data);
  }

  // Eliminar un documento
  deleteDocument(enlace: string, documentId: string) {
    const document = doc(this.firestore, `${enlace}/${documentId}`);
    return deleteDoc(document);
  }

  // Crear un ID de documento
  createIdDoc() {
    return uuidv4();
  }
}
