import { HttpClient, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError, of, Subject, filter, take } from 'rxjs';
import { BASE_URL } from './client';
import { tokenStorage } from './storage';
import type { RefreshResponse } from './types';
import { normalizeApiError } from './errors';

let isRefreshing = false;
const refreshDone$ = new Subject<string | null>();

async function refreshAccessToken(http: HttpClient): Promise<string | null> {
  const refreshToken = tokenStorage.getRefresh();
  if (!refreshToken) return null;

  try {
    const res = await http
      .post<RefreshResponse>(`${BASE_URL}/auth/refresh`, { refreshToken })
      .toPromise();

    const accessToken = res?.accessToken ?? null;
    const newRefresh = res?.refreshToken ?? null;

    if (accessToken) tokenStorage.setAccess(accessToken);
    if (newRefresh) tokenStorage.setRefresh(newRefresh);

    return accessToken;
  } catch (e) {
    throw normalizeApiError(e);
  }
}

export const refreshInterceptor: HttpInterceptorFn = (req, next) => {
  const http = inject(HttpClient);

  return next(req).pipe(
    catchError((err: unknown) => {
      if (!(err instanceof HttpErrorResponse)) {
        return throwError(() => normalizeApiError(err));
      }

      const status = err.status;
      const is401 = status === 401;

      // Evitar loop: si el 401 viene del refresh, limpiamos sesión
      const isRefreshCall = req.url.includes('/auth/refresh');

      if (!is401 || isRefreshCall) {
        return throwError(() => normalizeApiError(err));
      }

      // Si ya estamos refrescando, nos colgamos a la cola
      if (isRefreshing) {
        return refreshDone$.pipe(
          filter((t) => t !== undefined),
          take(1),
          switchMap((token) => {
            if (!token) return throwError(() => normalizeApiError(err));

            const cloned = req.clone({
              setHeaders: { Authorization: `Bearer ${token}` },
            });
            return next(cloned);
          }),
        );
      }

      isRefreshing = true;

      return of(null).pipe(
        switchMap(async () => {
          try {
            const token = await refreshAccessToken(http);
            isRefreshing = false;
            refreshDone$.next(token);

            if (!token) {
              tokenStorage.clear();
              throw normalizeApiError(err);
            }

            const cloned = req.clone({
              setHeaders: { Authorization: `Bearer ${token}` },
            });
            return next(cloned).toPromise();
          } catch (refreshErr) {
            isRefreshing = false;
            refreshDone$.next(null);
            tokenStorage.clear();
            throw normalizeApiError(refreshErr);
          }
        }),
        switchMap((res) => (res ? of(res) : throwError(() => normalizeApiError(err)))),
      );
    }),
  );
};
