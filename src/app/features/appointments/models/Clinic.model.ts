// models/Clinic.model.ts

export interface Clinic {
  id_clinic: string;   // GUID como string
  name: string;        // ✅ YA AGREGADO
  location: string;
  schedule: string;
}

// DTO para crear
export interface CreateClinicDto {
  name: string;
  location: string;
  schedule: string;
}

// Para el wizard
export interface SelectedClinic {
  id_clinic: string;
  name: string;        // ✅ IMPORTANTE también aquí
  location: string;
  schedule: string;
}