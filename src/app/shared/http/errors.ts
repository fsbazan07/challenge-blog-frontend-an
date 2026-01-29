import { HttpErrorResponse } from '@angular/common/http';
import type { ApiError, ErrorResponseDto } from './types';

function asMessage(msg: unknown): string {
  if (typeof msg === 'string') return msg;
  if (Array.isArray(msg)) return msg.filter(Boolean).join(' • ');
  return 'Ocurrió un error';
}

export function normalizeApiError(err: unknown): ApiError {
  if (!(err instanceof HttpErrorResponse)) {
    return err as ApiError;
  }

  const status = err.status ?? 0;
  const data = err.error as ErrorResponseDto | undefined;

  const msg = asMessage(data?.message) || err.message || 'No se pudo completar la solicitud';

  return {
    status,
    message: msg,
    details: data ?? err.error ?? err,
  };
}
