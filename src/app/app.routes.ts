import { Routes } from '@angular/router';
import { MainLayoutComponent } from './shared/layout/main-layout/main-layout.component';
import { AuthLayoutComponent } from './shared/layout/auth-layout/auth-layout.component';


export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'feed',
        pathMatch: 'full',
      },
      {
        path: 'feed',
        loadComponent: () =>
          import('./features/posts/pages/feed/feed.page').then((m) => m.FeedPage),
      },
    ],
  },
   {
    path: 'login',
    component: AuthLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/auth/pages/login/login.page').then(m => m.LoginPage),
      },
    ],
  },
];
