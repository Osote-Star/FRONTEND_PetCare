export type UserRole = 'admin' | 'superadmin';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  createdBy?: string;   // id del superadmin que lo registró
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: AdminUser;
}

export interface RegisterAdminRequest {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'superadmin';
}