export interface User {
  id_user: string;         // Guid en C# → string en TypeScript
  name: string;
  email: string;
  id_role: number;         // 1: Admin, 2: Veterinario, 3: Cliente
  phone?: string | null;
  created_at: Date;
  updated_at: Date;
  id_clinic?: string | null;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;        // Nota: Password con P mayúscula en C#
  id_role: number;
  phone?: string | null;
  id_clinic?: string | null;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface UpdateUserDto {
  name: string;
  email: string;
  phone?: string | null;
  password?: string | null;
  id_clinic?: string | null;
}

export interface UserSessionDto {
  id_user: string;
  name: string;
  email: string;
  id_role: number;
  phone?: string | null;
}

export interface LoginResponseDto {
  token: string;
  user: UserSessionDto;
}