import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user.model';
import { environment } from '../../environments/environment';
import { inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private currentUser = signal<User | null>(null);

  readonly user = this.currentUser.asReadonly();

  isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === 'admin';
  }

  login(email: string, password: string) {
    return this.http.post<{ token: string; user: User }>(
      `${environment.apiUrl}/auth/login`,
      { email, password }
    );
  }

  logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem('token');
  }
}


