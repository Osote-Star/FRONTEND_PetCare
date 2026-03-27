// core/services/wizard-state.service.ts
import { Injectable, signal, computed } from '@angular/core';
import { CreateAppointmentDto } from '../models/appointment.model';
import { CreatePetDto } from '../models/pet.model';

// ==================== MODELOS INTERNOS ====================

export interface WizardClinic {
  id_clinic: string;
  name: string;
  location: string;
  schedule: string;
}

export interface WizardService {
  id?: string;
  name: string;
  price: number;
  reason?: string;
  notes?: string;
}

export interface TutorData {
  email: string;
  nombre: string;
  apellido: string;
  telefono: string;
  comoEnteraste?: string;
  recordatorioVia?: string;
  notas?: string;
}

export interface MascotaData {
  id_pet?: string;
  nombre: string;
  edad: string;
  especie: string;
  raza?: string;
  peso?: string;
  sexo?: string;
  esterilizado?: string;
  alergias?: string;
  foto?: File | null;
}

export interface AppointmentCreationData {
  clinic: {
    id_clinic: string;
    name: string;
  };
  service: {
    id?: string;
    name: string;
    price: number;
    reason?: string;
    notes?: string;
  };
  veterinarian: {
    id: string;
    name: string;
  };
  dateTime: string;
  tutor?: {
    email: string;
    name: string;
    phone: string;
  };
  pet: {
    isNew: boolean;
    id?: string;
    data?: CreatePetDto;
  };
  userId: string;
}

// ==================== SERVICIO PRINCIPAL ====================

@Injectable({ providedIn: 'root' })
export class WizardStateService {
  // ==================== ESTADO PRIVADO ====================
  private clinicSignal = signal<WizardClinic | null>(null);
  private servicesSignal = signal<WizardService[]>([]);
  private tutorDataSignal = signal<TutorData | null>(null);
  private mascotaDataSignal = signal<MascotaData | null>(null);
  private selectedVeterinarianSignal = signal<{ id: string; name: string } | null>(null);
  private selectedDateTimeSignal = signal<{ date: string; time: string } | null>(null);

  // ==================== ESTADO PÚBLICO (readonly) ====================
  readonly clinic = this.clinicSignal.asReadonly();
  readonly services = this.servicesSignal.asReadonly();
  readonly tutorData = this.tutorDataSignal.asReadonly();
  readonly mascotaData = this.mascotaDataSignal.asReadonly();
  readonly selectedVeterinarian = this.selectedVeterinarianSignal.asReadonly();
  readonly selectedDateTime = this.selectedDateTimeSignal.asReadonly();

  // ==================== COMPUTED ====================
  readonly hasClinic = computed(() => this.clinicSignal() !== null);
  readonly hasService = computed(() => this.servicesSignal().length > 0);
  readonly hasTutor = computed(() => this.tutorDataSignal() !== null);
  readonly hasMascota = computed(() => this.mascotaDataSignal() !== null);
  readonly hasVeterinarian = computed(() => this.selectedVeterinarianSignal() !== null);
  readonly hasDateTime = computed(() => this.selectedDateTimeSignal() !== null);
  
  readonly isComplete = computed(() => {
    return this.hasClinic() && 
           this.hasService() && 
           this.hasTutor() && 
           this.hasMascota() && 
           this.hasVeterinarian() && 
           this.hasDateTime();
  });

  readonly currentStep = computed(() => {
    if (!this.hasClinic()) return 1;
    if (!this.hasService()) return 2;
    if (!this.hasTutor()) return 3;
    if (!this.hasMascota()) return 4;
    if (!this.hasVeterinarian() || !this.hasDateTime()) return 5;
    return 6;
  });

  // ==================== MÉTODOS DE SETEO ====================

  setClinic(data: WizardClinic): void {
    if (!data?.id_clinic) return;
    this.clinicSignal.set(data);
  }

  setServices(data: WizardService[]): void {
    if (!data?.length) return;
    this.servicesSignal.set([...data]);
  }

  setDatosTutor(data: TutorData): void {
    if (!data?.email || !data?.nombre) return;
    this.tutorDataSignal.set({ ...data });
  }

  setDatosMascota(data: MascotaData): void {
    if (!data?.nombre) return;
    this.mascotaDataSignal.set({ ...data });
  }

  setSelectedVeterinarian(vet: { id: string; name: string }): void {
    if (!vet?.id) return;
    this.selectedVeterinarianSignal.set({ ...vet });
  }

  setSelectedDateTime(date: string, time: string): void {
    if (!date || !time) return;
    this.selectedDateTimeSignal.set({ date, time });
  }

  // ==================== MÉTODOS GETTER ====================

  getClinic(): WizardClinic | null {
    return this.clinicSignal();
  }

  getServices(): WizardService[] {
    return this.servicesSignal();
  }

  getFirstService(): WizardService | null {
    const services = this.servicesSignal();
    return services.length > 0 ? services[0] : null;
  }

  getDatosTutor(): TutorData | null {
    return this.tutorDataSignal();
  }

  getDatosMascota(): MascotaData | null {
    return this.mascotaDataSignal();
  }

  getSelectedVeterinarian(): { id: string; name: string } | null {
    return this.selectedVeterinarianSignal();
  }

  getSelectedDateTime(): { date: string; time: string } | null {
    return this.selectedDateTimeSignal();
  }

  /**
   * Obtiene la fecha y hora en formato UTC ISO para la API
   */
  getAppointmentDateTime(): string | null {
    const dateTime = this.selectedDateTimeSignal();
    if (!dateTime) return null;
    
    const { date, time } = dateTime;
    
    // ✅ Parsear fecha
    let day: string, month: string, year: string;
    
    if (date.includes('/')) {
      [day, month, year] = date.split('/');
    } else if (date.includes('-')) {
      [year, month, day] = date.split('-');
    } else {
      return null;
    }
    
    const [hour, minute] = time.split(':');
    
    // ✅ Crear fecha UTC explícitamente
    const utcDate = new Date(Date.UTC(
      parseInt(year), 
      parseInt(month) - 1, 
      parseInt(day), 
      parseInt(hour), 
      parseInt(minute)
    ));
    
    return utcDate.toISOString();
  }

  /**
   * Obtiene resumen de los datos para mostrar en UI
   */
  getSummary() {
    const clinic = this.getClinic();
    const service = this.getFirstService();
    const mascota = this.getDatosMascota();
    const vet = this.getSelectedVeterinarian();
    const dateTime = this.getSelectedDateTime();

    return {
      clinicId: clinic?.id_clinic || null,
      clinicName: clinic?.name || null,
      clinicLocation: clinic?.location || null,
      clinicSchedule: clinic?.schedule || null,
      service: service?.name || null,
      serviceReason: service?.reason || null,
      cost: service?.price || null,
      petId: mascota?.id_pet || null,
      petName: mascota?.nombre || null,
      petBreed: mascota?.raza || null,
      veterinarianId: vet?.id || null,
      veterinarianName: vet?.name || null,
      date: dateTime?.date || null,
      time: dateTime?.time || null,
      appointmentDateTime: this.getAppointmentDateTime()
    };
  }

  /**
   * Obtiene datos completos para crear la cita
   */
  getAppointmentData(userId: string): AppointmentCreationData | null {
    const clinic = this.getClinic();
    const service = this.getFirstService();
    const veterinarian = this.getSelectedVeterinarian();
    const dateTime = this.getAppointmentDateTime();
    const mascota = this.getDatosMascota();
    const tutor = this.getDatosTutor();

    if (!clinic || !service || !veterinarian || !dateTime) {
      return null;
    }

    const petData = mascota ? {
      isNew: !mascota.id_pet,
      id: mascota.id_pet,
      data: {
        name: mascota.nombre,
        breed: mascota.raza || 'No especificada',
        weight: this.parseFloatSafe(mascota.peso),
        age: this.parseAge(mascota.edad)
      }
    } : null;

    const tutorData = tutor ? {
      email: tutor.email,
      name: `${tutor.nombre} ${tutor.apellido}`.trim(),
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
   * Construye el DTO para crear la cita
   */
  buildCreateAppointmentDto(userId: string): CreateAppointmentDto | null {
    const clinic = this.getClinic();
    const service = this.getFirstService();
    const veterinarian = this.getSelectedVeterinarian();
    const dateTime = this.getAppointmentDateTime();
    const mascota = this.getDatosMascota();

    if (!clinic || !service || !veterinarian || !dateTime) {
      return null;
    }

    const petId = mascota?.id_pet || '';

    return {
      id_user: userId,
      id_pet: petId,
      id_clinic: clinic.id_clinic,
      id_veterinarian: veterinarian.id,
      appointment_date: dateTime,
      service: service.reason ? `${service.name} - ${service.reason}` : service.name,
      cost: service.price
    };
  }

  // ==================== MÉTODOS DE COMPATIBILIDAD ====================

  get data() {
    return this.getSummary();
  }

  setAppointmentDetails(veterinarianId: string, appointmentDate: string): void {
    if (veterinarianId) {
      this.setSelectedVeterinarian({ id: veterinarianId, name: '' });
    }
    
    if (appointmentDate) {
      const date = appointmentDate.split('T')[0];
      const time = appointmentDate.split('T')[1]?.substring(0, 5) || '';
      this.setSelectedDateTime(date, time);
    }
  }

  setPet(petId: string, petName: string): void {
    const currentMascota = this.getDatosMascota();
    this.setDatosMascota({
      ...currentMascota,
      id_pet: petId,
      nombre: petName
    } as MascotaData);
  }

  clear(): void {
    this.reset();
  }

  // ==================== MÉTODOS AUXILIARES PRIVADOS ====================

  private parseFloatSafe(value: string | undefined): number {
    if (!value) return 0;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : Math.max(0, parsed);
  }

  private parseAge(ageString: string): number {
    if (!ageString) return 0;
    
    const match = ageString.match(/(\d+(?:\.\d+)?)/);
    if (!match) return 0;
    
    const value = parseFloat(match[1]);
    
    if (ageString.includes('mes')) {
      return Math.max(0, value / 12);
    }
    
    return Math.max(0, value);
  }

  // ==================== RESET ====================

  reset(): void {
    this.clinicSignal.set(null);
    this.servicesSignal.set([]);
    this.tutorDataSignal.set(null);
    this.mascotaDataSignal.set(null);
    this.selectedVeterinarianSignal.set(null);
    this.selectedDateTimeSignal.set(null);
  }

  clearClinic(): void {
    this.clinicSignal.set(null);
  }

  clearServices(): void {
    this.servicesSignal.set([]);
  }

  clearTutor(): void {
    this.tutorDataSignal.set(null);
  }

  clearMascota(): void {
    this.mascotaDataSignal.set(null);
  }

  clearVeterinarian(): void {
    this.selectedVeterinarianSignal.set(null);
  }

  clearDateTime(): void {
    this.selectedDateTimeSignal.set(null);
  }
}