import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SelectedServiceService {
  private selectedService: string;

  setSelectedService(service: string) {
    this.selectedService = service;
  }

  getSelectedService(): string {
    return this.selectedService;
  }
}