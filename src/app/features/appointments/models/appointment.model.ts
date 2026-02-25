export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type AppointmentType   = 'consultation' | 'vaccination' | 'grooming' | 'surgery' | 'emergency';

export interface Appointment {
  id:           string;
  ownerName:    string;
  ownerEmail:   string;
  ownerPhone:   string;
  petName:      string;
  petType:      string;
  type:         AppointmentType;
  date:         Date;
  time:         string;
  status:       AppointmentStatus;
  notes?:       string;
  veterinarian?: string;
  createdAt:    Date;
}

// Todos los usuarios son públicos — ownerName/Email/Phone siempre requeridos
export interface CreateAppointmentDto {
  ownerName:    string;
  ownerEmail:   string;
  ownerPhone:   string;
  petName:      string;
  petType:      string;
  type:         AppointmentType;
  date:         Date;
  time:         string;
  notes?:       string;
}