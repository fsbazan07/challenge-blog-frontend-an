import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthSessionService } from './auth-session.service';
import { tokenStorage } from '../../../shared/http/storage';
import { userStorage } from '../../../shared/http/user-storage';

describe('AuthSessionService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize access token and user from storages', () => {
    vi.spyOn(tokenStorage, 'getAccess').mockReturnValue('access_123');
    vi.spyOn(userStorage, 'get').mockReturnValue({ id: '1', name: 'Flor', email: 'a@a.com' });

    const service = new AuthSessionService();

    expect(service.isAuthenticated()).toBe(true);
    expect(service.userName()).toBe('Flor');
  });

  it('setTokens should persist tokens and update signal', () => {
    vi.spyOn(tokenStorage, 'getAccess').mockReturnValue(null);
    vi.spyOn(userStorage, 'get').mockReturnValue(null);

    const setAccess = vi.spyOn(tokenStorage, 'setAccess').mockImplementation(() => {});
    const setRefresh = vi.spyOn(tokenStorage, 'setRefresh').mockImplementation(() => {});

    const service = new AuthSessionService();
    service.setTokens('access_abc', 'refresh_def');

    expect(setAccess).toHaveBeenCalledWith('access_abc');
    expect(setRefresh).toHaveBeenCalledWith('refresh_def');
    expect(service.isAuthenticated()).toBe(true);
  });

  it('setTokens should not call setRefresh if refreshToken is undefined', () => {
    vi.spyOn(tokenStorage, 'getAccess').mockReturnValue(null);
    vi.spyOn(userStorage, 'get').mockReturnValue(null);

    vi.spyOn(tokenStorage, 'setAccess').mockImplementation(() => {});
    const setRefresh = vi.spyOn(tokenStorage, 'setRefresh').mockImplementation(() => {});

    const service = new AuthSessionService();
    service.setTokens('access_only');

    expect(setRefresh).not.toHaveBeenCalled();
    expect(service.isAuthenticated()).toBe(true);
  });

  it('setUser should persist user when user is not null', () => {
    vi.spyOn(tokenStorage, 'getAccess').mockReturnValue(null);
    vi.spyOn(userStorage, 'get').mockReturnValue(null);

    const setUser = vi.spyOn(userStorage, 'set').mockImplementation(() => {});

    const service = new AuthSessionService();
    service.setUser({ id: '1', name: 'Flor', email: 'a@a.com' });

    expect(setUser).toHaveBeenCalledWith({ id: '1', name: 'Flor', email: 'a@a.com' });
    expect(service.userName()).toBe('Flor');
  });

  it('setUser should clear storage when user is null', () => {
    vi.spyOn(tokenStorage, 'getAccess').mockReturnValue(null);
    vi.spyOn(userStorage, 'get').mockReturnValue({ id: '1', name: 'X', email: 'x@x.com' });

    const clearUser = vi.spyOn(userStorage, 'clear').mockImplementation(() => {});

    const service = new AuthSessionService();
    service.setUser(null);

    expect(clearUser).toHaveBeenCalled();
    expect(service.userName()).toBe('');
  });

  it('clear should clear both storages and reset signals', () => {
    vi.spyOn(tokenStorage, 'getAccess').mockReturnValue('access_123');
    vi.spyOn(userStorage, 'get').mockReturnValue({ id: '1', name: 'Flor', email: 'a@a.com' });

    const clearTokens = vi.spyOn(tokenStorage, 'clear').mockImplementation(() => {});
    const clearUser = vi.spyOn(userStorage, 'clear').mockImplementation(() => {});

    const service = new AuthSessionService();
    service.clear();

    expect(clearTokens).toHaveBeenCalled();
    expect(clearUser).toHaveBeenCalled();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.userName()).toBe('');
  });
});
