import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SurgeryType, BudgetRequest, BudgetResponse } from '../models/surgery.model';
import { environment } from '../../../environments/environment.prod';

@Injectable({ providedIn: 'root' })
export class SurgeryBudgetService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/surgery-budget`;

  getSurgeryTypes(): Observable<SurgeryType[]> {
    return this.http.get<SurgeryType[]>(`${this.base}/types`);
  }

  requestBudget(dto: BudgetRequest): Observable<BudgetResponse> {
    return this.http.post<BudgetResponse>(this.base, dto);
  }
}