import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import {  ApiResponse, User, LoginDto, LoginResponseDto, RegisterDto,   } from '../models/auth.model';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http   = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly base   = `${environment.apiUrl}`;

//mapear usuario

 private _isLoggedIn = signal(!!localStorage.getItem('token'));

  isLoggedIn = this._isLoggedIn.asReadonly();

  // ── Login ─────────────────────────────────────────────────────────────
 login(dto: LoginDto): Observable<ApiResponse<LoginResponseDto>> {
    return this.http.post<ApiResponse<LoginResponseDto>>(`${this.base}/auth/login`, dto).pipe(
      tap(response => {
        if (response.data?.token) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          this._isLoggedIn.set(true); 
        }
      })
    );
  }

register(dto: RegisterDto): Observable<ApiResponse<string>> {
  return this.http.post<ApiResponse<string>>(`${this.base}/auth/register`, dto);
}

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this._isLoggedIn.set(false);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }




private loadFromStorage(): User | null {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

}

