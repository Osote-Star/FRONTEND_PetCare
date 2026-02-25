import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DonationRequest, DonationResponse } from '../models/donation.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DonationService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/donations`;

  donate(dto: DonationRequest): Observable<DonationResponse> {
    return this.http.post<DonationResponse>(this.base, dto);
  }

  getStats(): Observable<{ total: number; count: number }> {
    return this.http.get<{ total: number; count: number }>(`${this.base}/stats`);
  }
}