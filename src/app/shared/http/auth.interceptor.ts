import { HttpInterceptorFn } from '@angular/common/http';
import { tokenStorage } from './storage';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const access = tokenStorage.getAccess();
  if (!access) return next(req);

  return next(
    req.clone({
      setHeaders: { Authorization: `Bearer ${access}` },
    }),
  );
};
