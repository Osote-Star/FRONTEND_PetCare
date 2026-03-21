// features/auth/services/auth.service.ts
import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { ApiResponse, LoginDto, LoginResponseDto, RegisterDto, UserSessionDto } from '../models/auth.model';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { RegisterVetDto } from '../models/vet.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly base = `${environment.apiUrl}`;
  
  private _isLoggedIn = signal(!!localStorage.getItem('token'));
  private _currentUser = signal<UserSessionDto | null>(null);

  isLoggedIn = this._isLoggedIn.asReadonly();
  currentUser = this._currentUser.asReadonly(); // 👈 NUEVO

  constructor() {
    this.loadUserFromStorage(); // 👈 Cargar usuario al iniciar
  }

  private loadUserFromStorage() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this._currentUser.set(user);
      } catch (e) {}
    }
  }

  login(dto: LoginDto): Observable<ApiResponse<LoginResponseDto>> {
    return this.http.post<ApiResponse<LoginResponseDto>>(`${this.base}/auth/login`, dto).pipe(
      tap(response => {
        if (response.data?.token) {
          // Guardar token
          localStorage.setItem('token', response.data.token);
          
          // 👇 GUARDAR USUARIO COMPLETO
          if (response.data.user) {
            localStorage.setItem('user', JSON.stringify(response.data.user));
            this._currentUser.set(response.data.user);
          }
          
          this._isLoggedIn.set(true);
        }
      })
    );
  }

  register(dto: RegisterDto): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.base}/auth/register`, dto);
  }

  registerVet(dto: RegisterVetDto): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.base}/auth/register`, dto);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // 👈 LIMPIAR USUARIO
    this._currentUser.set(null);
    this._isLoggedIn.set(false);
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // 👇 NUEVO - Obtener usuario guardado
  getCurrentUser(): UserSessionDto | null {
    return this._currentUser();
  }

  // Mantener getUser() para compatibilidad
  getUser() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  }

  getUserRole(): string {
    // 👇 PRIMERO INTENTAR CON USUARIO GUARDADO
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      if (currentUser.id_role === 1) return 'admin';
      if (currentUser.id_role === 2) return 'veterinario';
      if (currentUser.id_role === 3) return 'cliente';
    }
    
    // FALLBACK: decodificar token
    const user = this.getUser();
    if (!user) return '';
    return (
      user['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
      user['role'] ||
      ''
    );
  }

  isAdmin(): boolean {
    return this.getUserRole().toLowerCase() === 'admin';
  }
}