import { HttpErrorResponse } from '@angular/common/http';
import { normalizeHttpError } from './normalize-error';
import type { ApiError } from './types';

describe('normalizeHttpError', () => {
  it('should return the same error if it is already an ApiError (not HttpErrorResponse)', () => {
    const input: ApiError = { status: 400, message: 'Bad request', details: { a: 1 } };
    const out = normalizeHttpError(input);

    expect(out).toEqual(input);
  });

  it('should handle status 0 (network error)', () => {
    const err = new HttpErrorResponse({
      status: 0,
      statusText: 'Unknown Error',
      url: '/api/posts',
      error: null,
    });

    const out = normalizeHttpError(err);

    expect(out.status).toBe(0);
    expect(out.message).toBe('No se pudo conectar al servidor.');
    expect(out.details).toBe(err);
  });

  it('should use string body as message', () => {
    const err = new HttpErrorResponse({
      status: 401,
      statusText: 'Unauthorized',
      error: 'Token inválido',
    });

    const out = normalizeHttpError(err);

    expect(out.status).toBe(401);
    expect(out.message).toBe('Token inválido');
    expect(out.details).toBe('Token inválido');
  });

  it('should join array messages with bullet separator', () => {
    const err = new HttpErrorResponse({
      status: 422,
      error: { message: ['title requerido', 'content requerido'] },
    });

    const out = normalizeHttpError(err);

    expect(out.status).toBe(422);
    expect(out.message).toBe('title requerido • content requerido');
    expect(out.details).toEqual({ message: ['title requerido', 'content requerido'] });
  });

  it('should fallback to default when message is missing', () => {
    const err = new HttpErrorResponse({
      status: 500,
      statusText: 'Server error',
      error: {},
    });

    const out = normalizeHttpError(err);

    expect(out.status).toBe(500);
    expect(out.message).toBe('Ocurrió un error');
  });
});
