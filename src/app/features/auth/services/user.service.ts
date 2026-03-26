// features/auth/services/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, map } from 'rxjs';
import { User, ApiResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAll(): Observable<User[]> {
    return this.http.get<ApiResponse<User[]>>(`${this.base}/users`)
      .pipe(map(response => response.data));
  }

  getById(id: string): Observable<User> {
    return this.http.get<ApiResponse<User>>(`${this.base}/users/${id}`)
      .pipe(map(response => response.data));
  }

  update(id: string, data: any): Observable<User> {
    return this.http.put<ApiResponse<User>>(`${this.base}/users/${id}`, data)
      .pipe(map(response => response.data));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/users/${id}`)
      .pipe(map(response => { console.log(response.message); }));
  }
}