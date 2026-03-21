// features/auth/models/auth.model.ts

// 🔥 CONSTANTES DE ROLES
export const ROLES = {
  ADMIN: 1,
  VETERINARIO: 2,
  CLIENTE: 3
} as const;

export type RoleType = typeof ROLES[keyof typeof ROLES];

// ============================================
// MODELOS DE USUARIO
// ============================================

export interface User {
  id_user: string;      // Guid como string
  name: string;
  email: string;
  id_role: RoleType;
  phone?: string | null;
  created_at: Date;
  updated_at: Date;
  id_clinic?: string | null;
}

export interface UserSessionDto {
  id_user: string;
  name: string;
  email: string;
  id_role: RoleType;
  phone?: string | null;
  id_clinic?: string | null;
}

// ============================================
// DTOs DE AUTENTICACIÓN
// ============================================

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  phone: string;
  id_role: RoleType;
  id_clinic?: string | null;
}

export interface LoginResponseDto {
  token: string;
  user: UserSessionDto;
}

// ============================================
// DTO PARA ACTUALIZAR USUARIO
// ============================================

export interface UpdateUserDto {
  name: string;
  email: string;
  phone?: string | null;
  password?: string | null;
  id_clinic?: string | null;
}

// ============================================
// RESPUESTA GENÉRICA DE API
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}