import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container" style="max-width: 440px;">
      <div class="ap-card p-4 p-md-5 mt-5">
        <h3 class="fw-bold mb-1">Create your account</h3>
        <p class="text-secondary mb-4">Start applying smarter in minutes.</p>

        @if (error()) {
          <div class="alert alert-danger py-2">{{ error() }}</div>
        }

        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="mb-3">
            <label class="form-label">Full name</label>
            <input type="text" class="form-control" formControlName="fullName" placeholder="Jane Developer" />
          </div>
          <div class="mb-3">
            <label class="form-label">Email</label>
            <input type="email" class="form-control" formControlName="email" placeholder="you@example.com" />
          </div>
          <div class="mb-3">
            <label class="form-label">Password</label>
            <input type="password" class="form-control" formControlName="password" placeholder="At least 6 characters" />
            @if (form.controls.password.touched && form.controls.password.invalid) {
              <small class="text-danger">Password must be at least 6 characters.</small>
            }
          </div>
          <button class="btn btn-primary w-100" type="submit" [disabled]="form.invalid || loading()">
            @if (loading()) {
              <span class="spinner-border spinner-border-sm me-2"></span>
            }
            Create account
          </button>
        </form>

        <p class="text-center text-secondary mt-4 mb-0">
          Already have an account? <a routerLink="/login">Login</a>
        </p>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  error = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);
    const { fullName, email, password } = this.form.getRawValue();
    this.auth.register(fullName, email, password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Registration failed. Please try again.');
        this.loading.set(false);
      },
    });
  }
}
