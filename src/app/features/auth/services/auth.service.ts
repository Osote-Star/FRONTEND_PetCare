import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { AdminUser, LoginRequest, LoginResponse, RegisterAdminRequest } from '../models/auth.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http   = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly base   = `${environment.apiUrl}/auth`;

  // ── Estado reactivo con Signals ───────────────────────────────────────
  private readonly _currentUser = signal<AdminUser | null>(this.loadFromStorage());

  readonly currentUser  = this._currentUser.asReadonly();
  readonly isLoggedIn   = computed(() => this._currentUser() !== null);
  readonly isAdmin      = computed(() =>
    this._currentUser()?.role === 'admin' || this._currentUser()?.role === 'superadmin'
  );
  readonly isSuperAdmin = computed(() => this._currentUser()?.role === 'superadmin');

  // ── Login ─────────────────────────────────────────────────────────────
  login(dto: LoginRequest) {
    return this.http.post<LoginResponse>(`${this.base}/login`, dto).pipe(
      tap(({ token, user }) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        this._currentUser.set(user);
      })
    );
  }

  // ── Logout ────────────────────────────────────────────────────────────
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this._currentUser.set(null);
    this.router.navigate(['/']);
  }

  // ── Registro (solo superadmin) ────────────────────────────────────────
  registerAdmin(dto: RegisterAdminRequest) {
    return this.http.post<AdminUser>(`${this.base}/register`, dto);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private loadFromStorage(): AdminUser | null {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}