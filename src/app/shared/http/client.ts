import { inject } from '@angular/core';
import { HttpClient, HttpParams, type HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const BASE_URL = environment.apiUrl ?? 'http://localhost:3000/api';

type Options = {
  params?: Record<string, string | number | boolean | null | undefined>;
  headers?: HttpHeaders | Record<string, string>;
};

function toParams(params?: Options['params']): HttpParams | undefined {
  if (!params) return undefined;
  let p = new HttpParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === null || v === undefined) continue;
    p = p.set(k, String(v));
  }
  return p;
}

export function useHttp() {
  const http = inject(HttpClient);

  return {
    get<T>(url: string, options?: Options) {
      return http.get<T>(`${BASE_URL}${url}`, { ...options, params: toParams(options?.params) });
    },
    post<T, B = unknown>(url: string, body?: B, options?: Options) {
      return http.post<T>(`${BASE_URL}${url}`, body ?? {}, {
        ...options,
        params: toParams(options?.params),
      });
    },
    put<T, B = unknown>(url: string, body?: B, options?: Options) {
      return http.put<T>(`${BASE_URL}${url}`, body ?? {}, {
        ...options,
        params: toParams(options?.params),
      });
    },
    patch<T, B = unknown>(url: string, body?: B, options?: Options) {
      return http.patch<T>(`${BASE_URL}${url}`, body ?? {}, {
        ...options,
        params: toParams(options?.params),
      });
    },
    del<T>(url: string, options?: Options) {
      return http.delete<T>(`${BASE_URL}${url}`, { ...options, params: toParams(options?.params) });
    },
  };
}
