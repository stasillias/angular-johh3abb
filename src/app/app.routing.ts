import { Routes } from '@angular/router';

export const APP_ROUTES: Routes = [
  {
    path: '',
    redirectTo: '/stats',
    pathMatch: 'full',
  },
  {
    path: 'stats',
    loadComponent: () => import('./stats/stats').then((m) => m.Stats),
  },
  {
    path: 'logger',
    loadComponent: () => import('./logger/logger').then((m) => m.Logger),
  },
  {
    path: 'payment',
    loadComponent: () => import('./payment/payments').then((m) => m.Payments),
  },
];
