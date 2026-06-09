import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApplicationRequest, ApplicationStatus, JobApplication } from './models';

@Injectable({ providedIn: 'root' })
export class ApplicationService {
  private readonly api = `${environment.apiBaseUrl}/applications`;

  constructor(private http: HttpClient) {}

  list(status?: ApplicationStatus): Observable<JobApplication[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<JobApplication[]>(this.api, { params });
  }

  get(id: number): Observable<JobApplication> {
    return this.http.get<JobApplication>(`${this.api}/${id}`);
  }

  create(body: ApplicationRequest): Observable<JobApplication> {
    return this.http.post<JobApplication>(this.api, body);
  }

  update(id: number, body: ApplicationRequest): Observable<JobApplication> {
    return this.http.put<JobApplication>(`${this.api}/${id}`, body);
  }

  updateStatus(id: number, status: ApplicationStatus): Observable<JobApplication> {
    return this.http.put<JobApplication>(`${this.api}/${id}/status`, { status });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}
