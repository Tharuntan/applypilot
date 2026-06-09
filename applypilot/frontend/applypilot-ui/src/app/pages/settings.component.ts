import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { AiService, AiStatus } from '../core/ai.service';

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
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h6 class="fw-bold mb-0">AI Mode</h6>
          @if (ai(); as a) {
            @if (a.enabled) {
              <span class="badge text-bg-success"><i class="bi bi-stars me-1"></i>AI ON · {{ a.provider }}</span>
            } @else {
              <span class="badge text-bg-secondary"><i class="bi bi-cpu me-1"></i>Keyword mode</span>
            }
          }
        </div>
        @if (ai()?.enabled) {
          <p class="text-secondary mb-0">Using <strong>{{ ai()?.provider }}</strong> (model <code>{{ ai()?.model }}</code>) for analyses and documents. ✨</p>
        } @else {
          <p class="text-secondary mb-2">
            Currently using the built-in keyword analyzer + templates. To turn on real AI for free, set these
            backend environment variables and restart:
          </p>
          <pre class="bg-light border rounded p-3 small mb-0">AI_API_KEY=your_groq_key
AI_BASE_URL=https://api.groq.com/openai/v1
AI_MODEL=llama-3.3-70b-versatile</pre>
          <p class="text-secondary small mt-2 mb-0">Get a free key at <a href="https://console.groq.com/keys" target="_blank" rel="noopener">console.groq.com/keys</a>.</p>
        }
      </div>

      <div class="ap-card p-4">
        <h6 class="fw-bold mb-3">Account</h6>
        <button class="btn btn-outline-danger" (click)="logout()"><i class="bi bi-box-arrow-right me-1"></i>Logout</button>
      </div>
    </div>
  `,
})
export class SettingsComponent implements OnInit {
  readonly auth = inject(AuthService);
  private router = inject(Router);
  private aiService = inject(AiService);

  ai = signal<AiStatus | null>(null);

  ngOnInit(): void {
    this.aiService.status().subscribe({ next: (s) => this.ai.set(s), error: () => {} });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
