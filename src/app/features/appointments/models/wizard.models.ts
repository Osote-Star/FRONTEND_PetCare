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

export interface MascotaData {
  foto: File | null;
  nombre: string;
  edad: string;
  especie: string;
  raza: string;
  peso: string;
  sexo: string;
  esterilizado: string;
  alergias: string;
}

export interface DatosFormData {
  tutor: TutorData;
  mascota: MascotaData;
}

// Versión para API
export interface MascotaApiData {
  name: string;
  breed: string;
  weight: number;
  age: number;
}

export interface TutorApiData {
  email: string;
  name: string;
  phone: string;
}