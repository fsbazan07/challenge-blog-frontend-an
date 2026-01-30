// src/app/features/users/services/users.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../../environments/environment';
import type { ChangePasswordRequest, UpdateMeRequest, UserMe } from '../types/users.types';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private http = inject(HttpClient);

  me(): Promise<UserMe> {
    return firstValueFrom(this.http.get<UserMe>(`${environment.apiUrl}/users/me`));
  }
  updateMe(payload: UpdateMeRequest): Promise<UserMe> {
    return firstValueFrom(this.http.patch<UserMe>(`${environment.apiUrl}/users/me`, payload));
  }

  changePassword(payload: ChangePasswordRequest): Promise<{ ok: true }> {
    return firstValueFrom(
      this.http.patch<{ ok: true }>(`${environment.apiUrl}/users/me/password`, payload),
    );
  }

  deactivateMe(): Promise<{ ok: true }> {
    return firstValueFrom(
      this.http.patch<{ ok: true }>(`${environment.apiUrl}/users/me/deactivate`, {}),
    );
  }
}
