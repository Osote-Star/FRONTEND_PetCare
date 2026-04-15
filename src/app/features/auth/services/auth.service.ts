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
import { SanitizerService } from '@core/services/sanitizer.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly authModal = inject(AuthModalService);
  private readonly sanitizer = inject(SanitizerService); //  Para limpiar XSS
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
    //  Verificar token al inicio y cargar perfil si es necesario
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
   *  Sanitiza email para prevenir XSS
   */
  login(dto: LoginDto): Observable<ApiResponse<LoginResponseDto>> {
    //  Limpiar email (remover posibles scripts maliciosos)
    const sanitizedEmail = this.sanitizer.sanitizeText(dto.email);
    
    //  Validación básica en cliente
    if (!sanitizedEmail || !dto.password) {
      return throwError(() => new Error('Email y contraseña son requeridos'));
    }
    
    //  Validar formato de email después de sanitizar
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(sanitizedEmail)) {
      return throwError(() => new Error('Email inválido'));
    }
    
    //  La contraseña NO se sanitiza para no alterarla
    const sanitizedDto: LoginDto = {
      email: sanitizedEmail,
      password: dto.password
    };
    
    return this.http.post<ApiResponse<LoginResponseDto>>(`${this.base}/auth/login`, sanitizedDto).pipe(
      tap(response => {
        if (response.data?.token) {
          localStorage.setItem('token', response.data.token);
          this._isLoggedIn.set(true);
          
          //  Obtener perfil y ejecutar callbacks
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
   *  Sanitiza todos los campos de texto para prevenir XSS
   */
  register(dto: RegisterDto): Observable<ApiResponse<string>> {
    //  Limpiar todos los campos de texto
    const sanitizedName = this.sanitizer.sanitizeText(dto.name);
    const sanitizedEmail = this.sanitizer.sanitizeText(dto.email);
    const sanitizedPhone = dto.phone ? this.sanitizer.sanitizeText(dto.phone) : null;
    
    //  Validaciones en cliente
    if (!sanitizedName || sanitizedName.length < 3) {
      return throwError(() => new Error('El nombre debe tener al menos 3 caracteres'));
    }
    if (!sanitizedEmail || !sanitizedEmail.includes('@')) {
      return throwError(() => new Error('Email inválido'));
    }
    if (!dto.password || dto.password.length < 8) {
      return throwError(() => new Error('La contraseña debe tener al menos 8 caracteres'));
    }
    
    //  La contraseña NO se sanitiza
    const sanitizedDto: RegisterDto = {
      name: sanitizedName,
      email: sanitizedEmail,
      password: dto.password,
      phone: sanitizedPhone,
      id_role: dto.id_role,
      id_clinic: dto.id_clinic,
      schedule: dto.schedule
    };
    
    return this.http.post<ApiResponse<string>>(`${this.base}/auth/register`, sanitizedDto).pipe(
      tap(() => this.authModal.runAfterRegister()),
      catchError(error => this.handleAuthError(error))
    );
  }

  /**
   * Registra un nuevo veterinario (solo admin)
   *  Sanitiza todos los campos de texto
   */
  registerVet(dto: RegisterVetDto): Observable<ApiResponse<string>> {
    //  Limpiar campos de texto
    const sanitizedName = this.sanitizer.sanitizeText(dto.name);
    const sanitizedEmail = this.sanitizer.sanitizeText(dto.email);
    const sanitizedPhone = this.sanitizer.sanitizeText(dto.phone);
    const sanitizedSchedule = this.sanitizer.sanitizeText(dto.schedule);
    
    //  Validaciones en cliente
    if (!sanitizedName || sanitizedName.length < 3) {
      return throwError(() => new Error('El nombre debe tener al menos 3 caracteres'));
    }
    if (!sanitizedEmail || !sanitizedEmail.includes('@')) {
      return throwError(() => new Error('Email inválido'));
    }
    if (!dto.password || dto.password.length < 8) {
      return throwError(() => new Error('La contraseña debe tener al menos 8 caracteres'));
    }
    if (!dto.id_clinic) {
      return throwError(() => new Error('Debe seleccionar una clínica'));
    }
    if (!sanitizedSchedule) {
      return throwError(() => new Error('Debe especificar un horario'));
    }
    
    const sanitizedDto: RegisterVetDto = {
      name: sanitizedName,
      email: sanitizedEmail,
      password: dto.password, // ⚠️ No sanitizar
      phone: sanitizedPhone,
      id_clinic: dto.id_clinic,
      id_role: dto.id_role,
      schedule: sanitizedSchedule
    };
    
    return this.http.post<ApiResponse<string>>(`${this.base}/auth/register`, sanitizedDto).pipe(
      catchError(error => this.handleAuthError(error))
    );
  }

//registrar admin 




  /**
   * Actualiza datos de un veterinario
   */
  updateVet(id: string, dto: UpdateVetDto): Observable<ApiResponse<any>> {
    if (!id) {
      return throwError(() => new Error('ID de veterinario requerido'));
    }
    
    //  Sanitizar campos de texto
    const sanitizedDto = {
      ...dto,
      name: this.sanitizer.sanitizeText(dto.name),
      email: this.sanitizer.sanitizeText(dto.email),
      phone: this.sanitizer.sanitizeText(dto.phone),
      schedule: this.sanitizer.sanitizeText(dto.schedule)
      // password: dto.password //  No sanitizar si viene
    };
    
    return this.http.put<ApiResponse<any>>(`${this.base}/users/${id}`, sanitizedDto).pipe(
      catchError(error => this.handleAuthError(error))
    );
  }

  /**
   * Cierra sesión de forma segura
   *  Limpia localStorage, sessionStorage y notifica al backend
   */
  logout(): void {
    const token = this.getToken();
    
    // Limpiar sesión local
    this.clearSession();
    
    //  Notificar al backend para invalidar el token
    if (token) {
      this.http.post(`${this.base}/auth/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({
        error: () => console.warn('Error al cerrar sesión en backend')
      });
    }
    
    //  Limpiar sessionStorage por seguridad
    sessionStorage.clear();
    
    // Redirigir a home
    this.router.navigate(['/']);
  }

  /**
   *  Verifica si la sesión es válida (token no expirado)
   */
  isSessionValid(): boolean {
    if (!this._isLoggedIn()) return false;
    
    const token = this.getToken();
    if (!token) return false;
    
    // Verificar expiración
    if (!this.hasValidToken()) {
      this.logout();
      return false;
    }
    
    return true;
  }

  /**
   * ✅ Refresca el token si está por expirar
   */
  refreshToken(): Observable<string> {
    return this.http.post<ApiResponse<{ token: string }>>(`${this.base}/auth/refresh`, {})
      .pipe(
        map(response => {
          if (response.data?.token) {
            localStorage.setItem('token', response.data.token);
            return response.data.token;
          }
          throw new Error('No se pudo refrescar el token');
        }),
        catchError(error => {
          this.logout();
          return throwError(() => error);
        })
      );
  }

  // ==================== MÉTODOS PÚBLICOS ====================

  /**
   * Obtiene el token JWT
   */
  getToken(): string | null {
    const token = localStorage.getItem('token');
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
   *  Sanitiza todos los campos
   */
  updateProfile(dto: UpdateProfileDto): Observable<User> {
    //  Sanitizar campos
    const sanitizedName = this.sanitizer.sanitizeText(dto.name);
    const sanitizedEmail = this.sanitizer.sanitizeText(dto.email);
    const sanitizedPhone = dto.phone ? this.sanitizer.sanitizeText(dto.phone) : null;
    
    //  Validaciones
    if (!sanitizedName || sanitizedName.length < 3) {
      return throwError(() => new Error('El nombre debe tener al menos 3 caracteres'));
    }
    if (!sanitizedEmail || !sanitizedEmail.includes('@')) {
      return throwError(() => new Error('Email inválido'));
    }
    
    const sanitizedDto: UpdateProfileDto = {
      name: sanitizedName,
      email: sanitizedEmail,
      password: dto.password, // 
      phone: sanitizedPhone
    };
    
    return this.http.put<ApiResponse<User>>(`${this.usersUrl}/perfil`, sanitizedDto)
      .pipe(
        map(response => response.data),
        tap(updatedUser => {
          const current = this._currentUser();
          if (current && current.id_user === updatedUser.id_user) {
            const updatedSession: UserSession = {
              id_user: updatedUser.id_user,
              name: this.sanitizer.sanitizeText(updatedUser.name),
              email: this.sanitizer.sanitizeText(updatedUser.email),
              id_role: updatedUser.id_role,
              phone: updatedUser.phone ? this.sanitizer.sanitizeText(updatedUser.phone) : null,
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
   *  Sanitiza campos de texto
   */
  updateUser(id: string, dto: AdminUpdateUserDto): Observable<User> {
    if (!id) {
      return throwError(() => new Error('ID de usuario requerido'));
    }
    
    //  Sanitizar campos
    const sanitizedDto = {
      ...dto,
      name: this.sanitizer.sanitizeText(dto.name),
      email: this.sanitizer.sanitizeText(dto.email),
      phone: dto.phone ? this.sanitizer.sanitizeText(dto.phone) : null,
      schedule: dto.schedule ? this.sanitizer.sanitizeText(dto.schedule) : null
    };
    
    return this.http.put<ApiResponse<User>>(`${this.usersUrl}/${id}`, sanitizedDto)
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




requestPasswordReset(email: string) {
  return this.http.post(`${this.base}/auth/request-reset`, {
    email
  });
}

resetPassword(token: string, newPassword: string) {
  return this.http.post(`${this.base}/auth/reset-password`, {
    token,
    newPassword
  });
}




}