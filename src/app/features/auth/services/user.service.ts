import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { User } from '../models/auth.model';

interface ApiResponse<T>{
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

 private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<User[]>> {
    return this.http.get<ApiResponse<User[]>>(`${this.base}/Users`);
  }

  update(id: string, data: any){
  return this.http.put(`${this.base}/Users/${id}`, data);
}

delete(id: string){
  return this.http.delete(`${this.base}/Users/${id}`);
}

}
