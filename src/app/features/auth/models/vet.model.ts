
export interface RegisterVetDto {
  name: string;
  email: string;
  password: string;
  phone: string
  id_clinic: string;
  id_role: number;
}

export interface ApiResponse<T>{
  success: boolean;
  message: string;
  data: T;
}

export interface Clinic{
  id_clinic: string;
  name: string;
  location: string;
  schedule: string;
}