// features/auth/services/auth.service.ts
import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, map, tap, catchError, throwError } from 'rxjs';
import { 
  ApiResponse, 
  User, 
  LoginDto, 
  LoginResponseDto, 
  RegisterDto, 
  UserSession,
  UpdateProfileDto,
  AdminUpdateUserDto
} from '../models/auth.model';
import { environment } from '../../../environments/environment';
import { RegisterVetDto, UpdateVetDto } from '../models/vet.model';
import { AuthModalService } from './auth-modal.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly authModal = inject(AuthModalService);
  private readonly base = `${environment.apiUrl}`;
  private readonly usersUrl = `${environment.apiUrl}/users`;

  // ==================== ESTADO PRIVADO ====================
  private _isLoggedIn = signal<boolean>(this.hasValidToken());
  private _currentUser = signal<UserSession | null>(this.loadUserFromStorage());

  // ==================== ESTADO PÚBLICO (readonly) ====================
  readonly isLoggedIn = this._isLoggedIn.asReadonly();
  readonly currentUser = this._currentUser.asReadonly();

  /** Rol del usuario como número (1: admin, 2: veterinario, 3: cliente) */
  readonly userRole = computed(() => this._currentUser()?.id_role ?? null);
  
  /** Nombre del rol como string */
  readonly userRoleName = computed(() => {
    const role = this.userRole();
    if (role === 1) return 'admin';
    if (role === 2) return 'veterinario';
    if (role === 3) return 'cliente';
    return '';
  });

  /** Nombre para mostrar en UI */
  readonly userDisplayName = computed(() => {
    const user = this._currentUser();
    return user?.name || 'Usuario';
  });

  constructor() {
    // ✅ Verificar token al inicio y cargar perfil si es necesario
    if (this._isLoggedIn() && !this._currentUser()) {
      this.fetchProfile().subscribe({
        error: () => this.logout()
      });
    }
  }

  // ==================== MÉTODOS PRIVADOS ====================

  /**
   * Valida si el token existe y no ha expirado
   */
  private hasValidToken(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp;
      if (exp) {
        const expirationDate = new Date(exp * 1000);
        return expirationDate > new Date();
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Carga el usuario desde localStorage
   */
  private loadUserFromStorage(): UserSession | null {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    
    try {
      const user = JSON.parse(raw);
      // ✅ Validar estructura mínima
      if (user && user.id_user && user.name) {
        return user;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Guarda la sesión del usuario en memoria y localStorage
   */
  private setUserSession(user: UserSession): void {
    localStorage.setItem('user', JSON.stringify(user));
    this._currentUser.set(user);
  }

  /**
   * Limpia completamente la sesión
   */
  private clearSession(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this._isLoggedIn.set(false);
    this._currentUser.set(null);
  }

  /**
   * Maneja errores de autenticación
   */
  private handleAuthError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error de autenticación';
    
    if (error.status === 401) {
      errorMessage = 'Credenciales inválidas';
      this.clearSession();
    } else if (error.status === 403) {
      errorMessage = 'No tienes permisos para realizar esta acción';
    } else if (error.status === 409) {
      errorMessage = 'El correo ya está registrado';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }
    
    return throwError(() => new Error(errorMessage));
  }

  // ==================== AUTENTICACIÓN ====================

  /**
   * Inicia sesión con email y contraseña
   */
  login(dto: LoginDto): Observable<ApiResponse<LoginResponseDto>> {
    // ✅ Validación básica en cliente
    if (!dto.email || !dto.password) {
      return throwError(() => new Error('Email y contraseña son requeridos'));
    }
    
    return this.http.post<ApiResponse<LoginResponseDto>>(`${this.base}/auth/login`, dto).pipe(
      tap(response => {
        if (response.data?.token) {
          localStorage.setItem('token', response.data.token);
          this._isLoggedIn.set(true);
          
          // ✅ Obtener perfil y ejecutar callbacks
          this.fetchProfile().subscribe({
            next: () => {
              this.authModal.runAfterLogin();
              this.authModal.close();
            },
            error: () => this.authModal.close()
          });
        }
      }),
      catchError(error => this.handleAuthError(error))
    );
  }

  /**
   * Obtiene el perfil del usuario actual
   */
  fetchProfile(): Observable<UserSession> {
    return this.http.get<ApiResponse<UserSession>>(`${this.usersUrl}/perfil`).pipe(
      map(response => {
        if (!response.data) {
          throw new Error('No se recibieron datos del perfil');
        }
        return response.data;
      }),
      tap(user => {
        this.setUserSession(user);
        this._isLoggedIn.set(true);
      }),
      catchError(error => {
        this.clearSession();
        return this.handleAuthError(error);
      })
    );
  }

  /**
   * Registra un nuevo usuario (cliente)
   */
  register(dto: RegisterDto): Observable<ApiResponse<string>> {
    // ✅ Validaciones en cliente
    if (!dto.name || dto.name.length < 3) {
      return throwError(() => new Error('El nombre debe tener al menos 3 caracteres'));
    }
    if (!dto.email || !dto.email.includes('@')) {
      return throwError(() => new Error('Email inválido'));
    }
    if (!dto.password || dto.password.length < 8) {
      return throwError(() => new Error('La contraseña debe tener al menos 8 caracteres'));
    }
    
    return this.http.post<ApiResponse<string>>(`${this.base}/auth/register`, dto).pipe(
      tap(() => this.authModal.runAfterRegister()),
      catchError(error => this.handleAuthError(error))
    );
  }

  /**
   * Registra un nuevo veterinario (solo admin)
   */
  registerVet(dto: RegisterVetDto): Observable<ApiResponse<string>> {
    // ✅ Validaciones en cliente
    if (!dto.name || dto.name.length < 3) {
      return throwError(() => new Error('El nombre debe tener al menos 3 caracteres'));
    }
    if (!dto.email || !dto.email.includes('@')) {
      return throwError(() => new Error('Email inválido'));
    }
    if (!dto.password || dto.password.length < 8) {
      return throwError(() => new Error('La contraseña debe tener al menos 8 caracteres'));
    }
    if (!dto.id_clinic) {
      return throwError(() => new Error('Debe seleccionar una clínica'));
    }
    if (!dto.schedule) {
      return throwError(() => new Error('Debe especificar un horario'));
    }
    
    return this.http.post<ApiResponse<string>>(`${this.base}/auth/register`, dto).pipe(
      catchError(error => this.handleAuthError(error))
    );
  }

  /**
   * Actualiza datos de un veterinario
   */
  updateVet(id: string, dto: UpdateVetDto): Observable<ApiResponse<any>> {
    if (!id) {
      return throwError(() => new Error('ID de veterinario requerido'));
    }
    
    return this.http.put<ApiResponse<any>>(`${this.base}/users/${id}`, dto).pipe(
      catchError(error => this.handleAuthError(error))
    );
  }

  /**
   * Cierra sesión
   */
  logout(): void {
    this.clearSession();
    this.authModal.openLogin();
  }

  // ==================== MÉTODOS PÚBLICOS ====================

  /**
   * Obtiene el token JWT
   */
  getToken(): string | null {
    const token = localStorage.getItem('token');
    // ✅ Verificar que el token no esté expirado
    if (token && this.hasValidToken()) {
      return token;
    }
    return null;
  }

  /**
   * Decodifica el token JWT (sin validar expiración)
   */
  decodeToken(): any {
    const token = this.getToken();
    if (!token) return null;
    
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  }

  /**
   * Obtiene el rol del usuario desde la sesión o token
   */
  getUserRole(): string {
    const currentUser = this._currentUser();
    if (currentUser) {
      if (currentUser.id_role === 1) return 'admin';
      if (currentUser.id_role === 2) return 'veterinario';
      if (currentUser.id_role === 3) return 'cliente';
    }
    
    const token = this.decodeToken();
    if (!token) return '';
    
    return (
      token['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
      token['role'] ||
      ''
    );
  }

  /**
   * Obtiene el usuario actual
   */
  getCurrentUser(): UserSession | null {
    return this._currentUser();
  }

  /**
   * Obtiene el ID del rol
   */
  getRole(): number | null {
    return this.userRole();
  }

  /**
   * Obtiene el nombre del rol
   */
  getRoleName(): string {
    return this.userRoleName();
  }

  /**
   * Verifica si es administrador
   */
  isAdmin(): boolean {
    return this.getUserRole().toLowerCase() === 'admin';
  }

  /**
   * Verifica si es veterinario
   */
  isVeterinarian(): boolean {
    return this.getUserRole().toLowerCase() === 'veterinario';
  }

  /**
   * Verifica si es cliente
   */
  isClient(): boolean {
    return this.getUserRole().toLowerCase() === 'cliente';
  }

  /**
   * Verifica si tiene un rol específico por ID
   */
  hasRole(roleId: number): boolean {
    return this.getRole() === roleId;
  }

  /**
   * Obtiene el ID del usuario desde el token
   */
  getUserIdFromToken(): string | null {
    const payload = this.decodeToken();
    if (!payload) return null;
    
    return payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
           payload['nameidentifier'] ||
           payload['sub'] ||
           null;
  }

  // ==================== OPERACIONES CRUD DE USUARIOS ====================

  /**
   * Obtiene todos los usuarios (solo admin)
   */
  getAllUsers(): Observable<User[]> {
    return this.http.get<ApiResponse<User[]>>(`${this.usersUrl}`)
      .pipe(
        map(response => response.data),
        catchError(error => this.handleAuthError(error))
      );
  }

  /**
   * Obtiene todos los veterinarios
   */
  getVeterinarians(): Observable<User[]> {
    return this.http.get<ApiResponse<User[]>>(`${this.usersUrl}/veterinarians`)
      .pipe(
        map(response => response.data),
        catchError(error => this.handleAuthError(error))
      );
  }

  /**
   * Obtiene un usuario por ID (solo admin)
   */
  getUserById(id: string): Observable<User> {
    if (!id) {
      return throwError(() => new Error('ID de usuario requerido'));
    }
    
    return this.http.get<ApiResponse<User>>(`${this.usersUrl}/${id}`)
      .pipe(
        map(response => response.data),
        catchError(error => this.handleAuthError(error))
      );
  }

  /**
   * Actualiza el perfil del usuario actual
   */
  updateProfile(dto: UpdateProfileDto): Observable<User> {
    // ✅ Validaciones
    if (!dto.name || dto.name.length < 3) {
      return throwError(() => new Error('El nombre debe tener al menos 3 caracteres'));
    }
    if (!dto.email || !dto.email.includes('@')) {
      return throwError(() => new Error('Email inválido'));
    }
    
    return this.http.put<ApiResponse<User>>(`${this.usersUrl}/perfil`, dto)
      .pipe(
        map(response => response.data),
        tap(updatedUser => {
          const current = this._currentUser();
          if (current && current.id_user === updatedUser.id_user) {
            const updatedSession: UserSession = {
              id_user: updatedUser.id_user,
              name: updatedUser.name,
              email: updatedUser.email,
              id_role: updatedUser.id_role,
              phone: updatedUser.phone,
              schedule: updatedUser.schedule
            };
            this.setUserSession(updatedSession);
          }
        }),
        catchError(error => this.handleAuthError(error))
      );
  }

  /**
   * Actualiza un usuario (solo admin)
   */
  updateUser(id: string, dto: AdminUpdateUserDto): Observable<User> {
    if (!id) {
      return throwError(() => new Error('ID de usuario requerido'));
    }
    
    return this.http.put<ApiResponse<User>>(`${this.usersUrl}/${id}`, dto)
      .pipe(
        map(response => response.data),
        catchError(error => this.handleAuthError(error))
      );
  }

  /**
   * Elimina un usuario (solo admin)
   */
  deleteUser(id: string): Observable<void> {
    if (!id) {
      return throwError(() => new Error('ID de usuario requerido'));
    }
    
    return this.http.delete<ApiResponse<void>>(`${this.usersUrl}/${id}`)
      .pipe(
        map(() => void 0),
        catchError(error => this.handleAuthError(error))
      );
  }
}