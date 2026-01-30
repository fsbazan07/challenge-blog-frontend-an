import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { environment } from '../../../../environments/environment';
import { UsersService } from './users.service';
import type { UserMe } from '../types/users.types';

describe('UsersService', () => {
  let service: UsersService;
  let httpMock: HttpTestingController;

  const API = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UsersService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(UsersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('me: should GET /users/me and return UserMe', async () => {
    const promise = service.me();

    const req = httpMock.expectOne((r) => r.method === 'GET' && r.url === `${API}/users/me`);
    const mockUser: UserMe = {
      id: 'u1',
      name: 'Flor',
      email: 'a@a.com',
      isActive: true,
      role: 'admin',
    };
    req.flush(mockUser);

    const res = await promise;
    expect(res).toEqual(mockUser);
  });

  it('updateMe: should PATCH /users/me with payload and return UserMe', async () => {
    const promise = service.updateMe({ name: 'New Name' });

    const req = httpMock.expectOne((r) => r.method === 'PATCH' && r.url === `${API}/users/me`);
    expect(req.request.body).toEqual({ name: 'New Name' });

    const mockUser: UserMe = {
      id: 'u1',
      name: 'New Name',
      email: 'a@a.com',
      isActive: true,
      role: { id: 'r1', code: 'user', name: 'User' },
    };
    req.flush(mockUser);

    const res = await promise;
    expect(res).toEqual(mockUser);
  });

  it('changePassword: should PATCH /users/me/password with payload and return ok', async () => {
    const promise = service.changePassword({
      currentPassword: 'old',
      newPassword: 'new',
    });

    const req = httpMock.expectOne(
      (r) => r.method === 'PATCH' && r.url === `${API}/users/me/password`,
    );
    expect(req.request.body).toEqual({ currentPassword: 'old', newPassword: 'new' });

    req.flush({ ok: true });

    const res = await promise;
    expect(res.ok).toBe(true);
  });

  it('deactivateMe: should PATCH /users/me/deactivate with {} and return ok', async () => {
    const promise = service.deactivateMe();

    const req = httpMock.expectOne(
      (r) => r.method === 'PATCH' && r.url === `${API}/users/me/deactivate`,
    );
    expect(req.request.body).toEqual({});

    req.flush({ ok: true });

    const res = await promise;
    expect(res.ok).toBe(true);
  });
});
