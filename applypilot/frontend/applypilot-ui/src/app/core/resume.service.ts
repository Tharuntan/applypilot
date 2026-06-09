import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Resume, ResumeExtract, ResumeRequest } from './models';

@Injectable({ providedIn: 'root' })
export class ResumeService {
  private readonly api = `${environment.apiBaseUrl}/resumes`;

  constructor(private http: HttpClient) {}

  list(): Observable<Resume[]> {
    return this.http.get<Resume[]>(this.api);
  }

  /** Upload a PDF/DOCX/TXT and get back extracted text + a suggested title. */
  extractFromFile(file: File): Observable<ResumeExtract> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<ResumeExtract>(`${this.api}/extract`, form);
  }

  get(id: number): Observable<Resume> {
    return this.http.get<Resume>(`${this.api}/${id}`);
  }

  create(body: ResumeRequest): Observable<Resume> {
    return this.http.post<Resume>(this.api, body);
  }

  update(id: number, body: ResumeRequest): Observable<Resume> {
    return this.http.put<Resume>(`${this.api}/${id}`, body);
  }

  makePrimary(id: number): Observable<Resume> {
    return this.http.put<Resume>(`${this.api}/${id}/primary`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}
