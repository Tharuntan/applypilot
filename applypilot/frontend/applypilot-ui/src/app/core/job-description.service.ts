import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { JobDescription, JobDescriptionRequest } from './models';

@Injectable({ providedIn: 'root' })
export class JobDescriptionService {
  private readonly api = `${environment.apiBaseUrl}/job-descriptions`;

  constructor(private http: HttpClient) {}

  list(): Observable<JobDescription[]> {
    return this.http.get<JobDescription[]>(this.api);
  }

  get(id: number): Observable<JobDescription> {
    return this.http.get<JobDescription>(`${this.api}/${id}`);
  }

  create(body: JobDescriptionRequest): Observable<JobDescription> {
    return this.http.post<JobDescription>(this.api, body);
  }

  update(id: number, body: JobDescriptionRequest): Observable<JobDescription> {
    return this.http.put<JobDescription>(`${this.api}/${id}`, body);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}
