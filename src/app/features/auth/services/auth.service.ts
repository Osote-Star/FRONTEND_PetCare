import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import {  ApiResponse, User, LoginDto, LoginResponseDto, RegisterDto, UserSessionDto,   } from '../models/auth.model';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { RegisterVetDto } from '../models/vet.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http   = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly base   = `${environment.apiUrl}`;
  
 private _isLoggedIn = signal(!!localStorage.getItem('token'));

  isLoggedIn = this._isLoggedIn.asReadonly();

 login(dto: LoginDto): Observable<ApiResponse<LoginResponseDto>> {
    return this.http.post<ApiResponse<LoginResponseDto>>(`${this.base}/auth/login`, dto).pipe(
      tap(response => {
        if (response.data?.token) {
          localStorage.setItem('token', response.data.token);
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
    this._isLoggedIn.set(false);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

getUser() {
  const token = localStorage.getItem('token');
  if (!token) return null;

  const payload = JSON.parse(atob(token.split('.')[1]));
  return payload;
}

getUserRole(): string {
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