import { Routes } from '@angular/router';

export const enum RoutePath {
  Dashboard = 'dashboard',
  Accounts = 'accounts',
  Transactions = 'transactions',
  Settings = 'settings',
}

export const routes: Routes = [
  {
    path: RoutePath.Dashboard,
    loadComponent: () => import('./modules/dashboard').then(m => m.DashboardComponent),
    title: 'trackr | Dashboard',
  },
  {
    path: '',
    redirectTo: RoutePath.Dashboard,
    pathMatch: 'full',
  },
];
