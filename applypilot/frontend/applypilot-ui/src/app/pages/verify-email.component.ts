import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container" style="max-width: 480px;">
      <div class="ap-card ap-animate p-4 p-md-5 mt-5 text-center">
        <div class="mb-3"><span class="ap-brand"><i class="bi bi-rocket-takeoff-fill"></i> ApplyPilot</span></div>
        @if (loading()) {
          <div class="py-3"><span class="spinner-border text-primary"></span></div>
          <p class="text-secondary mb-0">Verifying your email…</p>
        } @else if (success()) {
          <i class="bi bi-check-circle-fill text-success" style="font-size:3rem;"></i>
          <h4 class="fw-bold mt-3">Email verified!</h4>
          <p class="text-secondary">{{ message() }}</p>
          <a class="btn btn-primary" routerLink="/dashboard">Go to dashboard</a>
        } @else {
          <i class="bi bi-x-circle-fill text-danger" style="font-size:3rem;"></i>
          <h4 class="fw-bold mt-3">Verification failed</h4>
          <p class="text-secondary">{{ message() }}</p>
          <a class="btn btn-outline-primary" routerLink="/dashboard">Back to app</a>
        }
      </div>
    </div>
  `,
})
export class VerifyEmailComponent implements OnInit {
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);

  loading = signal(true);
  success = signal(false);
  message = signal('');

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token') ?? '';
    if (!token) {
      this.loading.set(false);
      this.message.set('This verification link is missing its token.');
      return;
    }
    this.auth.verifyEmail(token).subscribe({
      next: (res) => {
        this.message.set(res.message);
        this.success.set(true);
        this.loading.set(false);
        // Refresh the cached user so the "verified" banner disappears.
        this.auth.me().subscribe({ error: () => {} });
      },
      error: (err) => {
        this.message.set(err?.error?.message ?? 'This verification link is invalid or expired.');
        this.loading.set(false);
      },
    });
  }
}
