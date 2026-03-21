// services/wizard-state.service.ts
import { Injectable } from '@angular/core';
import { PetFormData } from '../models/pet.model';
import { Clinic } from '../models/Clinic.model';
import { TutorData, MascotaData, AppointmentCreationData } from '../models/wizard.models';

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

@Injectable({ providedIn: 'root' })
export class WizardStateService {
  private clinic: WizardClinic | null = null;
  private services: WizardService[] = [];
  private tutorData: TutorData | null = null;
  private mascotaData: MascotaData | null = null;
  private selectedVeterinarian: { id: string; name: string } | null = null;
  private selectedDateTime: { date: string; time: string } | null = null;

  // CLINIC
  setClinic(data: WizardClinic) {
    console.log('🏥 Guardando clínica:', data);
    this.clinic = data;
  }
  
  getClinic(): WizardClinic | null {
    return this.clinic;
  }

  // SERVICES
  setServices(data: WizardService[]) {
    console.log('🩺 Guardando servicios:', data);
    this.services = data;
  }
  
  getServices(): WizardService[] {
    return this.services;
  }
  
  getFirstService(): WizardService | null {
    return this.services.length > 0 ? this.services[0] : null;
  }

  // TUTOR
  setDatosTutor(data: TutorData) {
    console.log('👤 Guardando datos del tutor:', data);
    this.tutorData = data;
  }

  getDatosTutor(): TutorData | null {
    return this.tutorData;
  }

  // MASCOTA
  setDatosMascota(data: MascotaData) {
    console.log('🐾 Guardando datos de la mascota:', data);
    this.mascotaData = data;
  }

  getDatosMascota(): MascotaData | null {
    return this.mascotaData;
  }

  // VETERINARIO SELECCIONADO
  setSelectedVeterinarian(vet: { id: string; name: string }) {
    console.log('👨‍⚕️ Guardando veterinario:', vet);
    this.selectedVeterinarian = vet;
  }

  getSelectedVeterinarian(): { id: string; name: string } | null {
    return this.selectedVeterinarian;
  }

  // FECHA Y HORA SELECCIONADA
  setSelectedDateTime(date: string, time: string) {
    console.log('📅 Guardando fecha/hora:', { date, time });
    this.selectedDateTime = { date, time };
  }

  getSelectedDateTime(): { date: string; time: string } | null {
    return this.selectedDateTime;
  }

  /**
   * Obtener fecha completa en formato ISO para la API
   * Ejemplo: "2024-03-20T10:30:00"
   */
  getAppointmentDateTime(): string | null {
    if (!this.selectedDateTime) return null;
    
    const { date, time } = this.selectedDateTime;
    // Convertir fecha de DD/MM/YYYY a YYYY-MM-DD si es necesario
    let formattedDate = date;
    if (date.includes('/')) {
      const [day, month, year] = date.split('/');
      formattedDate = `${year}-${month}-${day}`;
    }
    
    return `${formattedDate}T${time}:00`;
  }

  /**
   * Obtener datos completos para crear la cita
   */
  getAppointmentData(userId: string): AppointmentCreationData | null {
    const clinic = this.getClinic();
    const service = this.getFirstService();
    const veterinarian = this.getSelectedVeterinarian();
    const dateTime = this.getAppointmentDateTime();
    const mascota = this.getDatosMascota();

    if (!clinic || !service || !veterinarian || !dateTime) {
      console.error('❌ Faltan datos para crear la cita:', {
        clinic: !!clinic,
        service: !!service,
        veterinarian: !!veterinarian,
        dateTime: !!dateTime
      });
      return null;
    }

    // Preparar datos de la mascota
    const petData = mascota ? {
      isNew: !mascota.id_pet, // Si no tiene ID, es nueva
      id: mascota.id_pet,
      data: mascota ? {
        name: mascota.nombre,
        breed: mascota.raza || 'No especificada',
        weight: parseFloat(mascota.peso) || 0,
        age: this.parseAge(mascota.edad)
      } : undefined
    } : null;

    // Preparar datos del tutor (si es nuevo usuario)
    const tutor = this.getDatosTutor();
    const tutorData = tutor ? {
      email: tutor.email,
      name: `${tutor.nombre} ${tutor.apellido}`,
      phone: tutor.telefono
    } : undefined;

    return {
      clinic: {
        id_clinic: clinic.id_clinic,
        name: clinic.name
      },
      service: {
        id: service.id,
        name: service.name,
        price: service.price,
        reason: service.reason,
        notes: service.notes
      },
      veterinarian: {
        id: veterinarian.id,
        name: veterinarian.name
      },
      dateTime: dateTime,
      tutor: tutorData,
      pet: petData || { isNew: true },
      userId: userId
    };
  }

  /**
   * Parsear edad de string a número
   * Ejemplos: "2 años" → 2, "8 meses" → 0.66, "3" → 3
   */
  private parseAge(ageString: string): number {
    if (!ageString) return 0;
    
    const match = ageString.match(/(\d+(?:\.\d+)?)/);
    if (!match) return 0;
    
    const value = parseFloat(match[1]);
    
    if (ageString.includes('mes')) {
      return value / 12;
    }
    
    return value;
  }

  /**
   * Verificar si todos los datos necesarios están completos
   */
  isComplete(): boolean {
    return !!(
      this.getClinic() &&
      this.getFirstService() &&
      this.getSelectedVeterinarian() &&
      this.getSelectedDateTime() &&
      this.getDatosTutor() &&
      this.getDatosMascota()
    );
  }

  /**
   * Reset completo del wizard
   */
  reset() {
    console.log('🔄 Reseteando wizard state');
    this.clinic = null;
    this.services = [];
    this.tutorData = null;
    this.mascotaData = null;
    this.selectedVeterinarian = null;
    this.selectedDateTime = null;
  }
}