// services/user.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  User, 
  UpdateUserDto, 
  LoginDto, 
  RegisterDto, 
  LoginResponseDto, 
  ApiResponse 
} from '../../auth/models/auth.model'; // 👈 IMPORTAR DESDE AUTH

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/users`;
  private readonly authUrl = `${environment.apiUrl}/auth`;

  /**
   * Obtener todos los usuarios (solo admin)
   */
  getAllUsers(): Observable<User[]> {
    return this.http.get<ApiResponse<User[]>>(this.baseUrl)
      .pipe(map(response => response.data));
  }

  /**
   * Obtener veterinarios (para clientes al agendar cita)
   * ✅ Endpoint: /veterinarians
   */
  getVeterinarians(): Observable<User[]> {
    return this.http.get<ApiResponse<User[]>>(`${this.baseUrl}/veterinarians`)
      .pipe(map(response => response.data));
  }

  /**
   * Obtener perfil del usuario logueado
   */
  getProfile(): Observable<User> {
    return this.http.get<ApiResponse<User>>(`${this.baseUrl}/profile`)
      .pipe(map(response => response.data));
  }

  /**
   * Obtener usuario por ID
   */
  getUserById(id: string): Observable<User> {
    return this.http.get<ApiResponse<User>>(`${this.baseUrl}/${id}`)
      .pipe(map(response => response.data));
  }

  /**
   * Actualizar perfil del usuario logueado
   */
  updateProfile(dto: UpdateUserDto): Observable<User> {
    return this.http.put<ApiResponse<User>>(`${this.baseUrl}/profile`, dto)
      .pipe(map(response => response.data));
  }

  /**
   * Iniciar sesión (método de autenticación)
   */
  login(dto: LoginDto): Observable<LoginResponseDto> {
    return this.http.post<ApiResponse<LoginResponseDto>>(`${this.authUrl}/login`, dto)
      .pipe(map(response => response.data));
  }

  /**
   * Registrar usuario
   */
  register(dto: RegisterDto): Observable<User> {
    return this.http.post<ApiResponse<User>>(`${this.authUrl}/register`, dto)
      .pipe(map(response => response.data));
  }
}