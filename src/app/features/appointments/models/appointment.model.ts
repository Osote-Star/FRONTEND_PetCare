export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type AppointmentType = 'consultation' | 'vaccination' | 'grooming' | 'surgery' | 'emergency';

export interface Appointment {
  id_appointment: string;        
  user_name: string;           
  pet_name: string;             
  veterinarian_name: string;     
  date: string;                  
  service: string;             
  cost: number;
  status: string;                
}

export interface CreateAppointmentDto {
  id_user: string;
  id_pet: string;
  id_clinic: string;
  appointment_date: string;
  service: string;
  cost: number;
  id_veterinarian?: string; // 👈 OPCIONAL
}

// PARA CAMBIAR ESTADO
export interface CambiarStatusDto {
  status: string; 
}

// Para asignar veterinario
export interface AssignVetDto {
  id_veterinarian: string;
}