export interface User {
  id: string;
  name: string;
  email: string;
  phone: number;
  role: number;
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

