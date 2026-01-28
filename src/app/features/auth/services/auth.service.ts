import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { catchError, tap, throwError } from 'rxjs';
import { normalizeHttpError } from '../../../shared/http/normalize-error';
import type { ApiError } from '../../../shared/http/types';
import { AuthSessionService } from './auth-session.service';

export type LoginRequest = { email: string; password: string };
export type LoginResponse = { accessToken?: string; refreshToken?: string };
export type MeResponse = { user: { id: string; name: string; email: string } };

export type RegisterRequest = { name: string; email: string; password: string };
export type RegisterResponse = { accessToken?: string; refreshToken?: string };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private session = inject(AuthSessionService);

  login(payload: LoginRequest) {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, payload).pipe(
      tap((res) => {
        if (res.accessToken) {
          this.session.setTokens(res.accessToken, res.refreshToken);
        }
      }),
      catchError((e) => throwError(() => normalizeHttpError(e) as ApiError)),
    );
  }

  me() {
    return this.http.get<MeResponse>(`${environment.apiUrl}/auth/me`).pipe(
      tap((res) => this.session.setUser(res.user)),
      catchError((e) => throwError(() => normalizeHttpError(e) as ApiError)),
    );
  }

  // Si querés mantener estas firmas para no tocar otros lugares:
  saveSession(accessToken: string, refreshToken?: string) {
    this.session.setTokens(accessToken, refreshToken);
  }

  clearSession() {
    this.session.clear();
  }

  isAuthenticated() {
    return this.session.isAuthenticated();
  }

  register(payload: RegisterRequest) {
    return this.http.post<RegisterResponse>(`${environment.apiUrl}/auth/register`, payload).pipe(
      tap((res) => {
        if (res.accessToken) {
          this.session.setTokens(res.accessToken, res.refreshToken);
        }
      }),
      catchError((e) => throwError(() => normalizeHttpError(e))),
    );
  }
}
