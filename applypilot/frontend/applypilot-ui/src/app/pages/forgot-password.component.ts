import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container" style="max-width: 440px;">
      <div class="ap-card ap-animate p-4 p-md-5 mt-5">
        <div class="text-center mb-3"><span class="ap-brand"><i class="bi bi-rocket-takeoff-fill"></i> ApplyPilot</span></div>
        <h3 class="fw-bold mb-1">Forgot password?</h3>
        <p class="text-secondary mb-4">Enter your email and we'll send you a reset link.</p>

        @if (sent()) {
          <div class="alert alert-success">{{ message() }}</div>
          <a class="btn btn-outline-primary w-100" routerLink="/login">Back to login</a>
        } @else {
          <form [formGroup]="form" (ngSubmit)="submit()">
            <div class="mb-3">
              <label class="form-label">Email</label>
              <input type="email" class="form-control" formControlName="email" placeholder="you@example.com" />
            </div>
            <button class="btn btn-primary w-100" type="submit" [disabled]="form.invalid || loading()">
              @if (loading()) { <span class="spinner-border spinner-border-sm me-2"></span> }
              Send reset link
            </button>
          </form>
          <p class="text-center text-secondary mt-4 mb-0"><a routerLink="/login">Back to login</a></p>
        }
      </div>
    </div>
  `,
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  loading = signal(false);
  sent = signal(false);
  message = signal('');

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.auth.forgotPassword(this.form.getRawValue().email).subscribe({
      next: (res) => {
        this.message.set(res.message);
        this.sent.set(true);
        this.loading.set(false);
      },
      error: () => {
        // Still show success to avoid revealing whether the email exists.
        this.message.set('If an account exists for that email, a reset link has been sent.');
        this.sent.set(true);
        this.loading.set(false);
      },
    });
  }
}
