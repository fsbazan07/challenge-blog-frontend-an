import { Injectable, computed, signal } from '@angular/core';
import { tokenStorage } from '../../../shared/http/storage';

type User = { id: string; name: string; email: string } | null;

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  private _accessToken = signal<string | null>(tokenStorage.getAccess());
  private _user = signal<User>(null);

  isAuthenticated = computed(() => Boolean(this._accessToken()));
  userName = computed(() => this._user()?.name ?? '');

  setTokens(accessToken: string, refreshToken?: string) {
    tokenStorage.setAccess(accessToken);
    if (refreshToken) tokenStorage.setRefresh(refreshToken);
    this._accessToken.set(accessToken);
  }

  clear() {
    tokenStorage.clear();
    this._accessToken.set(null);
    this._user.set(null);
  }

  setUser(user: User) {
    this._user.set(user);
  }
}
