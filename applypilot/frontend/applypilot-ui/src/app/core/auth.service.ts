import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse, UserResponse } from './models';

const TOKEN_KEY = 'applypilot.token';
const USER_KEY = 'applypilot.user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = `${environment.apiBaseUrl}/auth`;

  private readonly _user = signal<UserResponse | null>(this.readStoredUser());
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null && !!this.token);

  constructor(private http: HttpClient) {}

  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  register(fullName: string, email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.api}/register`, { fullName, email, password })
      .pipe(tap((res) => this.persist(res)));
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.api}/login`, { email, password })
      .pipe(tap((res) => this.persist(res)));
  }

  me(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.api}/me`).pipe(tap((u) => this._user.set(u)));
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._user.set(null);
  }

  private persist(res: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    this._user.set(res.user);
  }

  private readStoredUser(): UserResponse | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UserResponse;
    } catch {
      return null;
    }
  }
}
