import { Injectable } from '@angular/core';

export type LoginRequest = { email: string; password: string; remember?: boolean };
export type LoginResponse = { accessToken?: string; refreshToken?: string };

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // TODO: en el próximo paso lo conectamos a HttpClient y al backend
  async login(payload: LoginRequest): Promise<LoginResponse> {
    console.log('login payload', payload);

    // stub de éxito:
    const res: LoginResponse = { accessToken: 'stub' };
    if (res.accessToken) this.saveSession(res.accessToken, res.refreshToken);

    return res;
  }

  saveSession(accessToken: string, refreshToken?: string) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  clearSession() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}
