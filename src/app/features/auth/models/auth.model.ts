export type UserRole = 'admin' | 'superadmin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date; // id del superadmin que lo registró
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  roleid: 2;
}