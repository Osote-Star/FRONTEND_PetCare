import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user.models';
import { environment } from '../../environments/environment';
import { inject } from '@angular/core';
import { ApiResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class ApiService {

  private http = inject(HttpClient);

  get<T>(url: string) {
    return this.http.get<ApiResponse<T>>(url);
  }

  post<T>(url: string, body: any) {
    return this.http.post<ApiResponse<T>>(url, body);
  }

  put<T>(url: string, body: any) {
    return this.http.put<ApiResponse<T>>(url, body);
  }

  patch<T>(url: string, body: any) {
    return this.http.patch<ApiResponse<T>>(url, body);
  }

  delete<T>(url: string) {
    return this.http.delete<ApiResponse<T>>(url);
  }
}