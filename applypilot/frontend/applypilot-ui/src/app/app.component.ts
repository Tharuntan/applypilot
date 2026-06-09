import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar navbar-expand-lg ap-navbar sticky-top">
      <div class="container">
        <a class="navbar-brand ap-brand d-flex align-items-center gap-2" routerLink="/">
          <i class="bi bi-rocket-takeoff-fill"></i> ApplyPilot
        </a>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNav"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="mainNav">
          @if (auth.isAuthenticated()) {
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
              <li class="nav-item"><a class="nav-link" routerLink="/dashboard" routerLinkActive="active text-primary fw-semibold">Dashboard</a></li>
              <li class="nav-item"><a class="nav-link" routerLink="/resumes" routerLinkActive="active text-primary fw-semibold">Resumes</a></li>
              <li class="nav-item"><a class="nav-link" routerLink="/jobs" routerLinkActive="active text-primary fw-semibold">Jobs</a></li>
              <li class="nav-item"><a class="nav-link" routerLink="/analyze" routerLinkActive="active text-primary fw-semibold">Analyze</a></li>
              <li class="nav-item"><a class="nav-link" routerLink="/applications" routerLinkActive="active text-primary fw-semibold">Tracker</a></li>
              <li class="nav-item"><a class="nav-link" routerLink="/documents" routerLinkActive="active text-primary fw-semibold">Documents</a></li>
            </ul>
            <div class="dropdown">
              <button class="btn btn-light border dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                <i class="bi bi-person-circle me-1"></i>{{ auth.user()?.fullName }}
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li><a class="dropdown-item" routerLink="/settings"><i class="bi bi-gear me-2"></i>Settings</a></li>
                <li><hr class="dropdown-divider" /></li>
                <li><button class="dropdown-item text-danger" (click)="logout()"><i class="bi bi-box-arrow-right me-2"></i>Logout</button></li>
              </ul>
            </div>
          } @else {
            <ul class="navbar-nav ms-auto mb-2 mb-lg-0 align-items-lg-center gap-lg-2">
              <li class="nav-item"><a class="nav-link" routerLink="/login">Login</a></li>
              <li class="nav-item"><a class="btn btn-primary px-3" routerLink="/register">Start Free</a></li>
            </ul>
          }
        </div>
      </div>
    </nav>

    @if (auth.isAuthenticated() && auth.user() && !auth.user()!.emailVerified) {
      <div class="alert alert-warning border-0 rounded-0 mb-0 py-2">
        <div class="container d-flex flex-wrap align-items-center justify-content-center gap-2 small">
          <span><i class="bi bi-envelope-exclamation me-1"></i>Please verify your email.</span>
          @if (resendState() === 'idle') {
            <button class="btn btn-sm btn-link p-0 align-baseline" (click)="resend()">Resend verification email</button>
          } @else if (resendState() === 'sending') {
            <span class="text-muted">Sending…</span>
          } @else {
            <span class="text-success">Sent! Check your inbox.</span>
          }
        </div>
      </div>
    }

    <main>
      <router-outlet />
    </main>
  `,
})
export class AppComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  resendState = signal<'idle' | 'sending' | 'sent'>('idle');

  resend(): void {
    this.resendState.set('sending');
    this.auth.resendVerification().subscribe({
      next: () => this.resendState.set('sent'),
      error: () => this.resendState.set('sent'),
    });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
