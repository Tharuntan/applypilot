import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container" style="max-width: 440px;">
      <div class="ap-card p-4 p-md-5 mt-5">
        <h3 class="fw-bold mb-1">Welcome back</h3>
        <p class="text-secondary mb-4">Log in to your ApplyPilot account.</p>

        @if (error()) {
          <div class="alert alert-danger py-2">{{ error() }}</div>
        }

        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="mb-3">
            <label class="form-label">Email</label>
            <input type="email" class="form-control" formControlName="email" placeholder="you@example.com" />
          </div>
          <div class="mb-3">
            <label class="form-label">Password</label>
            <input type="password" class="form-control" formControlName="password" placeholder="••••••••" />
          </div>
          <button class="btn btn-primary w-100" type="submit" [disabled]="form.invalid || loading()">
            @if (loading()) {
              <span class="spinner-border spinner-border-sm me-2"></span>
            }
            Login
          </button>
        </form>

        <p class="text-center text-secondary mt-4 mb-0">
          No account? <a routerLink="/register">Start free</a>
        </p>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  error = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);
    const { email, password } = this.form.getRawValue();
    this.auth.login(email, password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Login failed. Please check your credentials.');
        this.loading.set(false);
      },
    });
  }
}
