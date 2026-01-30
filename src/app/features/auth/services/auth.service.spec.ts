import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { AuthService } from './auth.service';
import { AuthSessionService } from './auth-session.service';
import { environment } from '../../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  // spies del session service
  let session: {
    setTokens: ReturnType<typeof vi.fn>;
    setUser: ReturnType<typeof vi.fn>;
    clear: ReturnType<typeof vi.fn>;
    isAuthenticated: ReturnType<typeof vi.fn>;
  };

  const API = environment.apiUrl;

  beforeEach(() => {
    session = {
      setTokens: vi.fn(),
      setUser: vi.fn(),
      clear: vi.fn(),
      isAuthenticated: vi.fn().mockReturnValue(true),
    };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthSessionService, useValue: session },
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('login: should POST /auth/login and setTokens when accessToken exists', () => {
    service.login({ email: 'a@a.com', password: '123' }).subscribe();

    const req = httpMock.expectOne((r) => r.method === 'POST' && r.url === `${API}/auth/login`);
    expect(req.request.body).toEqual({ email: 'a@a.com', password: '123' });

    req.flush({ accessToken: 'AT', refreshToken: 'RT' });

    expect(session.setTokens).toHaveBeenCalledWith('AT', 'RT');
  });

  it('login: should not setTokens when accessToken is missing', () => {
    service.login({ email: 'a@a.com', password: '123' }).subscribe();

    const req = httpMock.expectOne((r) => r.method === 'POST' && r.url === `${API}/auth/login`);
    req.flush({}); // sin tokens

    expect(session.setTokens).not.toHaveBeenCalled();
  });

  it('me: should GET /auth/me and setUser', () => {
    service.me().subscribe();

    const req = httpMock.expectOne((r) => r.method === 'GET' && r.url === `${API}/auth/me`);

    req.flush({ user: { id: '1', name: 'Flor', email: 'a@a.com' } });

    expect(session.setUser).toHaveBeenCalledWith({ id: '1', name: 'Flor', email: 'a@a.com' });
  });

  it('saveSession: should call session.setTokens', () => {
    service.saveSession('AT', 'RT');
    expect(session.setTokens).toHaveBeenCalledWith('AT', 'RT');
  });

  it('clearSession: should call session.clear', () => {
    service.clearSession();
    expect(session.clear).toHaveBeenCalled();
  });

  it('isAuthenticated: should proxy session.isAuthenticated', () => {
    session.isAuthenticated.mockReturnValue(false);
    expect(service.isAuthenticated()).toBe(false);

    session.isAuthenticated.mockReturnValue(true);
    expect(service.isAuthenticated()).toBe(true);
  });

  it('logout: should POST /auth/logout and clear session on success', () => {
    service.logout().subscribe((res) => {
      expect(res.ok).toBe(true);
    });

    const req = httpMock.expectOne((r) => r.method === 'POST' && r.url === `${API}/auth/logout`);
    expect(req.request.body).toEqual({});

    req.flush({ ok: true });

    expect(session.clear).toHaveBeenCalled();
  });

  it('logout: should clear session even when request fails', () => {
    service.logout().subscribe({
      next: () => {
        throw new Error('should not succeed');
      },
      error: () => {
        // ok
      },
    });

    const req = httpMock.expectOne((r) => r.method === 'POST' && r.url === `${API}/auth/logout`);
    req.flush('boom', { status: 500, statusText: 'Server Error' });

    expect(session.clear).toHaveBeenCalled();
  });

  it('register: should POST /auth/register and setTokens + setUser when accessToken exists', () => {
    service.register({ name: 'Flor', email: 'a@a.com', password: '123' }).subscribe();

    const req = httpMock.expectOne((r) => r.method === 'POST' && r.url === `${API}/auth/register`);
    expect(req.request.body).toEqual({ name: 'Flor', email: 'a@a.com', password: '123' });

    req.flush({
      accessToken: 'AT',
      refreshToken: 'RT',
      user: { id: '1', name: 'Flor', email: 'a@a.com' },
    });

    expect(session.setTokens).toHaveBeenCalledWith('AT', 'RT');
    expect(session.setUser).toHaveBeenCalledWith({ id: '1', name: 'Flor', email: 'a@a.com' });
  });

  it('register: should not setTokens/setUser when accessToken is missing', () => {
    service.register({ name: 'Flor', email: 'a@a.com', password: '123' }).subscribe();

    const req = httpMock.expectOne((r) => r.method === 'POST' && r.url === `${API}/auth/register`);

    req.flush({
      user: { id: '1', name: 'Flor', email: 'a@a.com' },
    });

    expect(session.setTokens).not.toHaveBeenCalled();
    expect(session.setUser).not.toHaveBeenCalled();
  });
});
