
export interface RegisterDto {
  name: string;
  email: string;
  password: string;        // ← Atención: en backend es "Password" con mayúscula
  phone: string | null;    // ← string? en backend
  id_role: number;         // 1, 2 o 3
  id_clinic?: string | null;   // Guid? opcional
  schedule?: string | null;     // string? opcional (para veterinarios)
}


export interface LoginDto {
  email: string;
  password: string;        // ← Atención: en backend es "Password" con mayúscula
}

export interface User {
  id_user: string;         // Guid como string
  name: string;
  email: string;
  id_role: number;         // 1: admin, 2: veterinario, 3: cliente
  phone: string | null;
  schedule: string | null; // ← IMPORTANTE: schedule está en User, no en Clinic
  created_at: Date;
  updated_at: Date;
  id_clinic: string | null; // Guid? opcional
}

/**
 * Sesión del usuario - Coincide con UserSessionDto del backend
 */
export interface UserSession {
  id_user: string;         // Guid como string
  name: string;
  email: string;
  id_role: number;
  phone: string | null;
  schedule: string | null; // ← schedule también está en la sesión
}

/**
 * Respuesta del login - Coincide con LoginResponseDto del backend
 */
export interface LoginResponseDto {
  token: string;           // Solo token, el usuario viene aparte
  user?: UserSession;      // En tu implementación actual, probablemente viene con el user
}

/**
 * Para editar perfil propio - Coincide con UpdateProfileDto del backend
 */
export interface UpdateProfileDto {
  name: string;
  email: string;
  password?: string;       // Opcional, solo si quiere cambiar contraseña
  phone?: string | null;
}

/**
 * Para admin editar cualquier usuario - Coincide con AdminUpdateUserDto
 */
export interface AdminUpdateUserDto {
  name: string;
  email: string;
  phone?: string | null;
  id_role: number;
  id_clinic?: string | null;
  schedule?: string | null;
}

/**
 * Respuesta genérica de la API
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}