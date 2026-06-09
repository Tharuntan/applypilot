import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AiStatus {
  enabled: boolean;
  model: string | null;
  provider: string;
}

@Injectable({ providedIn: 'root' })
export class AiService {
  private readonly api = `${environment.apiBaseUrl}/ai`;

  constructor(private http: HttpClient) {}

  status(): Observable<AiStatus> {
    return this.http.get<AiStatus>(`${this.api}/status`);
  }
}
