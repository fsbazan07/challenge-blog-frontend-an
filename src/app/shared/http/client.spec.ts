import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { useHttp, BASE_URL } from './client';

describe('shared/http/client.ts - useHttp', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('GET: should call BASE_URL + url and map params (skip null/undefined)', () => {
    const api = TestBed.runInInjectionContext(() => useHttp());

    api
      .get<{ ok: true }>('/posts', {
        params: {
          page: 1,
          limit: 10,
          q: 'hello',
          active: true,
          skipNull: null,
          skipUndef: undefined,
        },
      })
      .subscribe((res) => {
        expect(res.ok).toBe(true);
      });

    const req = httpMock.expectOne((r) => r.method === 'GET' && r.url === `${BASE_URL}/posts`);
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('limit')).toBe('10');
    expect(req.request.params.get('q')).toBe('hello');
    expect(req.request.params.get('active')).toBe('true');
    expect(req.request.params.has('skipNull')).toBe(false);
    expect(req.request.params.has('skipUndef')).toBe(false);

    req.flush({ ok: true });
  });

  it('POST: should send empty object as default body when body is undefined', () => {
    const api = TestBed.runInInjectionContext(() => useHttp());

    api.post<{ ok: true }, undefined>('/auth/login', undefined).subscribe((res) => {
      expect(res.ok).toBe(true);
    });

    const req = httpMock.expectOne(
      (r) => r.method === 'POST' && r.url === `${BASE_URL}/auth/login`,
    );
    expect(req.request.body).toEqual({}); // default body
    req.flush({ ok: true });
  });

  it('PUT/PATCH: should also default body to {} when body is undefined', () => {
    const api = TestBed.runInInjectionContext(() => useHttp());

    api.put<{ ok: true }, undefined>('/x', undefined).subscribe();
    let req = httpMock.expectOne((r) => r.method === 'PUT' && r.url === `${BASE_URL}/x`);
    expect(req.request.body).toEqual({});
    req.flush({ ok: true });

    api.patch<{ ok: true }, undefined>('/y', undefined).subscribe();
    req = httpMock.expectOne((r) => r.method === 'PATCH' && r.url === `${BASE_URL}/y`);
    expect(req.request.body).toEqual({});
    req.flush({ ok: true });
  });

  it('DELETE: should call BASE_URL + url and map params', () => {
    const api = TestBed.runInInjectionContext(() => useHttp());

    api.del<{ ok: true }>('/posts/1', { params: { hard: true } }).subscribe((res) => {
      expect(res.ok).toBe(true);
    });

    const req = httpMock.expectOne((r) => r.method === 'DELETE' && r.url === `${BASE_URL}/posts/1`);
    expect(req.request.params.get('hard')).toBe('true');
    req.flush({ ok: true });
  });
});
