import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DashboardSummary } from './models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly api = `${environment.apiBaseUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  summary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${this.api}/summary`);
  }
}
