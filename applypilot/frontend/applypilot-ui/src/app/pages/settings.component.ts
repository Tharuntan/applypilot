import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container py-4" style="max-width: 680px;">
      <h3 class="fw-bold mb-4">Settings</h3>

      <div class="ap-card p-4 mb-4">
        <h6 class="fw-bold mb-3">Profile</h6>
        @if (auth.user(); as u) {
          <div class="row mb-2"><div class="col-4 text-secondary">Name</div><div class="col-8">{{ u.fullName }}</div></div>
          <div class="row mb-2"><div class="col-4 text-secondary">Email</div><div class="col-8">{{ u.email }}</div></div>
          <div class="row mb-2"><div class="col-4 text-secondary">Role</div><div class="col-8">{{ u.role }}</div></div>
          <div class="row"><div class="col-4 text-secondary">Member since</div><div class="col-8">{{ u.createdAt | date: 'mediumDate' }}</div></div>
        }
      </div>

      <div class="ap-card p-4 mb-4">
        <h6 class="fw-bold mb-3">AI Mode</h6>
        <p class="text-secondary mb-2">
          ApplyPilot works with or without an AI provider. When the backend has an <code>AI_API_KEY</code>
          configured, analyses and documents are AI-generated. Otherwise a built-in keyword analyzer and
          templates are used.
        </p>
        <p class="text-secondary small mb-0">Configure AI via backend environment variables: <code>AI_API_KEY</code>, <code>AI_BASE_URL</code>, <code>AI_MODEL</code>.</p>
      </div>

      <div class="ap-card p-4">
        <h6 class="fw-bold mb-3">Account</h6>
        <button class="btn btn-outline-danger" (click)="logout()"><i class="bi bi-box-arrow-right me-1"></i>Logout</button>
      </div>
    </div>
  `,
})
export class SettingsComponent {
  readonly auth = inject(AuthService);
  private router = inject(Router);

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
