import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideIcons } from '@ng-icons/core';
import { APP_ICONS } from './shared/icons/app-icons';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './shared/http/auth.interceptor';
import { refreshInterceptor } from './shared/http/refresh.interceptor';
import { ToastService } from './shared/ui/toast/toast.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideIcons(APP_ICONS),
    provideHttpClient(withInterceptors([authInterceptor, refreshInterceptor])),
    ToastService,
  ],
};
