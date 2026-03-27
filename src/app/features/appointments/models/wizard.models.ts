// models/wizard.models.ts
import { PetFormData } from "./pet.model";

export interface TutorData {
  email: string;
  nombre: string;
  apellido: string;
  telefono: string;
  comoEnteraste: string;
  recordatorioVia: string;
  notas: string;
}

/**
 * Datos de la mascota para el wizard (UI)
 * SOLO los campos que se usan en el formulario
 */
export interface MascotaData {
  foto: File | null;      // Solo UI
  nombre: string;         // → name en API
  edad: string;           // → age en API (convertido a número)
  especie: string;        // Solo UI (no se envía a API)
  raza: string;           // → breed en API
  peso: string;           // → weight en API (convertido a número)
  sexo: string;           // Solo UI (no se envía a API)
  esterilizado: string;   // Solo UI (no se envía a API)
  alergias: string;       // Solo UI (no se envía a API)
  id_pet?: string;        // ID si es mascota existente
}

export interface DatosFormData {
  tutor: TutorData;
  mascota: MascotaData;
}

/**
 * DTO para enviar a la API - Crear mascota
 */
export interface MascotaApiData {
  name: string;      // nombre
  breed: string;     // raza
  weight: number;    // peso en kg
  age: number;       // edad en años
}

/**
 * DTO para enviar a la API - Datos del tutor para crear usuario
 */
export interface TutorApiData {
  email: string;
  name: string;
  phone: string;
}

/**
 * Datos completos para crear una cita
 */
export interface AppointmentCreationData {
  clinic: {
    id_clinic: string;
    name: string;
  };
  service: {
    id: string;
    name: string;
    price: number;
    reason?: string;
    notes?: string;
  };
  veterinarian: {
    id: string;
    name: string;
  };
  dateTime: string; // ISO format: "2024-03-20T10:30:00"
  tutor?: TutorApiData;
  pet: {
    isNew: boolean;
    id?: string;
    data?: MascotaApiData;
  };
  userId?: string;
}

/**
 * Respuesta después de crear cita
 */
export interface AppointmentResponse {
  id_appointment: string;
  message: string;
  status: string;
}