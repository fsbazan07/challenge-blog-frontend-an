import { HttpErrorResponse } from '@angular/common/http';
import { normalizeApiError } from './errors';
import type { ApiError } from './types';

describe('normalizeApiError', () => {
  it('should return input as ApiError when it is not HttpErrorResponse', () => {
    const input: ApiError = { status: 403, message: 'Forbidden' };
    const out = normalizeApiError(input);

    expect(out).toEqual(input);
  });

  it('should map HttpErrorResponse using data.message (string)', () => {
    const err = new HttpErrorResponse({
      status: 404,
      error: { message: 'No encontrado' },
    });

    const out = normalizeApiError(err);

    expect(out.status).toBe(404);
    expect(out.message).toBe('No encontrado');
    expect(out.details).toEqual({ message: 'No encontrado' });
  });

  it('should join data.message array with bullets', () => {
    const err = new HttpErrorResponse({
      status: 400,
      error: { message: ['email inválido', 'password requerido'] },
    });

    const out = normalizeApiError(err);

    expect(out.status).toBe(400);
    expect(out.message).toBe('email inválido • password requerido');
  });

  it('should fallback to default message when data.message is missing', () => {
    const err = new HttpErrorResponse({
      status: 500,
      error: {},
      statusText: 'Server Error',
    });

    const out = normalizeApiError(err);

    expect(out.status).toBe(500);
    expect(out.message).toBe('Ocurrió un error');
  });
});
