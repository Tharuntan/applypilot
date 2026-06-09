import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { GeneratedDocument, GenerateDocumentRequest } from './models';

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private readonly api = `${environment.apiBaseUrl}/documents`;

  constructor(private http: HttpClient) {}

  generate(body: GenerateDocumentRequest): Observable<GeneratedDocument> {
    return this.http.post<GeneratedDocument>(`${this.api}/generate`, body);
  }

  list(): Observable<GeneratedDocument[]> {
    return this.http.get<GeneratedDocument[]>(this.api);
  }

  get(id: number): Observable<GeneratedDocument> {
    return this.http.get<GeneratedDocument>(`${this.api}/${id}`);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}
