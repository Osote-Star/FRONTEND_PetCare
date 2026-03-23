export interface User {
  id_user: string;
  name: string;
  email: string;
  phone: number;
  id_role: number;
  id_clinic: string;
  schedule: string;
}


export interface LoginDto {
  email: string;
  password: string;
}

export interface UserSessionDto {
  id_user: number;
  name: string;
  email: string;
  id_role: number;
}

export interface LoginResponseDto {
  token: string;
  user: UserSessionDto;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  phone: string
  id_role: number;
}

