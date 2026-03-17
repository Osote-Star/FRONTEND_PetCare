import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse, Clinic } from '../models/vet.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClinicService {

    private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAll(){
  return this.http.get<ApiResponse<Clinic[]>>(`${this.base}/Clinics`);
}
}