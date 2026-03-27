// features/appointments/models/appointment.model.ts

// ============================================
// TIPOS ENUM (para mejor tipado)
// ============================================

export type AppointmentStatus = 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
export type AppointmentType = 'consulta' | 'vacunacion' | 'estetica' | 'cirugia' | 'emergencia';

// ============================================
// MODELO COMPLETO DE CITA (lo que devuelve la API)
// ============================================

export interface Appointment {
  id_appointment: string;
  user_name: string;
  pet_name: string;
  veterinarian_name: string;
  date: string;              // ISO format: "2024-03-20T10:30:00"
  service: string;
  cost: number;
  status: AppointmentStatus; // ✅ mejor tipado
  clinic_name?: string;      // ✅ opcional
  created_at?: string;       // ✅ opcional
}

// ============================================
// DTO PARA CREAR CITA (lo que envías a la API)
// ============================================

export interface CreateAppointmentDto {
  id_user: string;           // ✅ REQUERIDO - ID del cliente
  id_pet: string;            // ✅ REQUERIDO - ID de la mascota
  id_clinic: string;         // ✅ REQUERIDO - ID de la clínica
  id_veterinarian: string;   // ✅ REQUERIDO - ID del veterinario
  appointment_date: string;  // ✅ REQUERIDO - ISO: "2024-03-20T10:30:00"
  service: string;           // ✅ REQUERIDO - nombre del servicio
  cost: number;              // ✅ REQUERIDO - precio
  notes?: string;            // ✅ OPCIONAL - notas adicionales
}

// ============================================
// DTO PARA CAMBIAR ESTADO
// ============================================

export interface CambiarStatusDto {
  status: AppointmentStatus; // ✅ mejor tipado
  reason?: string;           // ✅ opcional - razón si es cancelada
}

// ============================================
// DTO PARA ASIGNAR VETERINARIO
// ============================================

export interface AssignVetDto {
  id_veterinarian: string;
  id_appointment?: string;   // ✅ opcional - si se asigna en la misma cita
}

// ============================================
// DTO PARA RESPUESTA DE FECHAS DISPONIBLES
// ============================================

export interface AvailableDate {
  date: string;              // "2024-03-20"
  slots: string[];           // ["09:00", "10:00", "11:00"]
  hasAvailable: boolean;
}

export interface AvailableSlotsResponse {
  date: string;
  veterinarian_id: string;
  slots: string[];
  occupied_slots: string[];
}