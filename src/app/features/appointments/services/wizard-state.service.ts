// services/wizard-state.service.ts
import { Injectable } from '@angular/core';
import { PetFormData } from '../models/pet.model';
import { Clinic } from '../models/Clinic.model';
export interface WizardService {
  id: string;
  name: string;
  price: number;
  reason?: string;
  notes?: string;
}

export interface WizardClinic {
  id_clinic: string;
  name: string;
  location: string;
  schedule: string;
}

export interface TutorData {
  email: string;
  nombre: string;
  apellido: string;
  telefono: string;
  comoEnteraste: string;
  recordatorioVia: string;
  notas: string;
}

@Injectable({ providedIn: 'root' })
export class WizardStateService {
  private clinic: WizardClinic | null = null;
  private services: WizardService[] = [];
  private tutorData: TutorData | null = null;
  private mascotaData: PetFormData | null = null;

  // CLINIC
  setClinic(data: WizardClinic) {
    console.log('WizardState - Guardando clínica:', data);
    this.clinic = data;
  }
  
  getClinic(): WizardClinic | null {
    return this.clinic;
  }

  // SERVICES
  setServices(data: WizardService[]) {
    console.log('WizardState - Guardando servicios:', data);
    this.services = data;
  }
  
  getServices(): WizardService[] {
    return this.services;
  }

  // TUTOR
  setDatosTutor(data: TutorData) {
    console.log('WizardState - Guardando tutor:', data);
    this.tutorData = data;
  }

  getDatosTutor(): TutorData | null {
    return this.tutorData;
  }

  // MASCOTA
  setDatosMascota(data: PetFormData) {
    console.log('WizardState - Guardando mascota:', data);
    this.mascotaData = data;
  }

  getDatosMascota(): PetFormData | null {
    return this.mascotaData;
  }

  // Reset completo
  reset() {
    this.clinic = null;
    this.services = [];
    this.tutorData = null;
    this.mascotaData = null;
  }
}