import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/landing.component').then((m) => m.LandingComponent),
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'resumes',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/resume-list.component').then((m) => m.ResumeListComponent),
  },
  {
    path: 'resumes/new',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/resume-edit.component').then((m) => m.ResumeEditComponent),
  },
  {
    path: 'resumes/:id/edit',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/resume-edit.component').then((m) => m.ResumeEditComponent),
  },
  {
    path: 'jobs',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/job-list.component').then((m) => m.JobListComponent),
  },
  {
    path: 'jobs/new',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/job-edit.component').then((m) => m.JobEditComponent),
  },
  {
    path: 'jobs/:id/edit',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/job-edit.component').then((m) => m.JobEditComponent),
  },
  {
    path: 'analyze',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/match-analyzer.component').then((m) => m.MatchAnalyzerComponent),
  },
  {
    path: 'reports/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/match-report.component').then((m) => m.MatchReportComponent),
  },
  {
    path: 'applications',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/application-list.component').then((m) => m.ApplicationListComponent),
  },
  {
    path: 'applications/new',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/application-edit.component').then((m) => m.ApplicationEditComponent),
  },
  {
    path: 'applications/:id/edit',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/application-edit.component').then((m) => m.ApplicationEditComponent),
  },
  {
    path: 'documents',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/documents.component').then((m) => m.DocumentsComponent),
  },
  {
    path: 'settings',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/settings.component').then((m) => m.SettingsComponent),
  },
  { path: '**', redirectTo: '' },
];
