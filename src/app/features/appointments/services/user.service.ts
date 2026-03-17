// services/user.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, UpdateUserDto, LoginDto, RegisterDto, LoginResponseDto } from '../models/user.model';
import { ApiResponse } from '../../auth/models/auth.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/users`;
  private readonly authUrl = `${environment.apiUrl}/auth`; // Asumiendo que hay un endpoint auth

  getAllUsers(): Observable<User[]> {
    return this.http.get<ApiResponse<User[]>>(this.baseUrl)
      .pipe(map(response => response.data));
  }

  getVeterinarians(): Observable<User[]> {
    return this.http.get<ApiResponse<User[]>>(`${this.baseUrl}/veterinarians`)
      .pipe(map(response => response.data));
  }

  getProfile(): Observable<User> {
    return this.http.get<ApiResponse<User>>(`${this.baseUrl}/profile`)
      .pipe(map(response => response.data));
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<ApiResponse<User>>(`${this.baseUrl}/${id}`)
      .pipe(map(response => response.data));
  }

  updateProfile(dto: UpdateUserDto): Observable<User> {
    return this.http.put<ApiResponse<User>>(`${this.baseUrl}/profile`, dto)
      .pipe(map(response => response.data));
  }

  // Auth methods
  login(dto: LoginDto): Observable<LoginResponseDto> {
    return this.http.post<ApiResponse<LoginResponseDto>>(`${this.authUrl}/login`, dto)
      .pipe(map(response => response.data));
  }

  register(dto: RegisterDto): Observable<User> {
    return this.http.post<ApiResponse<User>>(`${this.authUrl}/register`, dto)
      .pipe(map(response => response.data));
  }
}