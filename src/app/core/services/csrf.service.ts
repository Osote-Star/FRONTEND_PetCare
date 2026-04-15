import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
@Injectable({ providedIn: 'root' })
export class CsrfService {
  private http = inject(HttpClient);
  private csrfToken: string | null = null;
  private baseUrl = environment.apiUrl;

  async initCsrf(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ csrfToken: string }>(`${this.baseUrl}/csrf-token`)
      );
      this.csrfToken = response.csrfToken;
      sessionStorage.setItem('csrfToken', this.csrfToken);
    } catch (error) {
      console.warn('CSRF init failed', error);
    }
  }

  getToken(): string | null {
    return this.csrfToken || sessionStorage.getItem('csrfToken');
  }

  refreshToken(): Promise<void> {
    this.csrfToken = null;
    sessionStorage.removeItem('csrfToken');
    return this.initCsrf();
  }
}
