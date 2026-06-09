import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container" style="max-width: 440px;">
      <div class="ap-card ap-animate p-4 p-md-5 mt-5">
        <div class="text-center mb-3"><span class="ap-brand"><i class="bi bi-rocket-takeoff-fill"></i> ApplyPilot</span></div>
        <h3 class="fw-bold mb-1">Set a new password</h3>
        <p class="text-secondary mb-4">Choose a new password for your account.</p>

        @if (!token) {
          <div class="alert alert-danger">This reset link is missing its token. Please use the link from your email.</div>
          <a class="btn btn-outline-primary w-100" routerLink="/forgot-password">Request a new link</a>
        } @else if (done()) {
          <div class="alert alert-success">{{ message() }}</div>
          <a class="btn btn-primary w-100" routerLink="/login">Go to login</a>
        } @else {
          @if (error()) { <div class="alert alert-danger">{{ error() }}</div> }
          <form [formGroup]="form" (ngSubmit)="submit()">
            <div class="mb-3">
              <label class="form-label">New password</label>
              <input type="password" class="form-control" formControlName="password" placeholder="At least 6 characters" />
            </div>
            <button class="btn btn-primary w-100" type="submit" [disabled]="form.invalid || loading()">
              @if (loading()) { <span class="spinner-border spinner-border-sm me-2"></span> }
              Reset password
            </button>
          </form>
        }
      </div>
    </div>
  `,
})
export class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);

  token = '';
  loading = signal(false);
  done = signal(false);
  message = signal('');
  error = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
  }

  submit(): void {
    if (this.form.invalid || !this.token) return;
    this.loading.set(true);
    this.error.set(null);
    this.auth.resetPassword(this.token, this.form.getRawValue().password).subscribe({
      next: (res) => {
        this.message.set(res.message);
        this.done.set(true);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Could not reset password.');
        this.loading.set(false);
      },
    });
  }
}
