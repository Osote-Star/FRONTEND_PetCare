
export interface RegisterVetDto {
  name: string;
  email: string;
  password: string;
  phone: string
  id_clinic: string;
  id_role: number;
  schedule: string;
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


export interface UpdateVetDto{
  name: string;
  email: string;
  phone: string;
  password?: string;
  id_clinic: string;
  schedule: string;
}