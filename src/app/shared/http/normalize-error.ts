import { HttpErrorResponse } from '@angular/common/http';
import type { ApiError, ErrorResponseDto } from './types';

function asMessage(msg: unknown): string {
  if (typeof msg === 'string') return msg;
  if (Array.isArray(msg)) return msg.filter(Boolean).join(' • ');
  return 'Ocurrió un error';
}

export function normalizeHttpError(err: ApiError | HttpErrorResponse): ApiError {
  if (!(err instanceof HttpErrorResponse)) {
    return err;
  }

  const status = err.status ?? 0;
  const data = err.error as ErrorResponseDto | string | null;

  if (status === 0) {
    return {
      status: 0,
      message: 'No se pudo conectar al servidor.',
      details: err,
    };
  }

  const msg =
    typeof data === 'string' ? data : asMessage((data as ErrorResponseDto | undefined)?.message);

  return {
    status,
    message: msg || err.message || 'No se pudo completar la solicitud',
    details: data ?? err,
  };
}
