import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { MatchReport } from './models';

@Injectable({ providedIn: 'root' })
export class MatchService {
  private readonly api = `${environment.apiBaseUrl}/match`;

  constructor(private http: HttpClient) {}

  analyze(resumeId: number, jobDescriptionId: number): Observable<MatchReport> {
    return this.http.post<MatchReport>(`${this.api}/analyze`, { resumeId, jobDescriptionId });
  }

  reports(): Observable<MatchReport[]> {
    return this.http.get<MatchReport[]>(`${this.api}/reports`);
  }

  report(id: number): Observable<MatchReport> {
    return this.http.get<MatchReport>(`${this.api}/reports/${id}`);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/reports/${id}`);
  }
}
