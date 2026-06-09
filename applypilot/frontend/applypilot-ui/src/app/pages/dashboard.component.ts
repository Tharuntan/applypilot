import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../core/dashboard.service';
import { AuthService } from '../core/auth.service';
import { DashboardSummary } from '../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 class="fw-bold mb-0">Dashboard</h3>
          <p class="text-secondary mb-0">Your job search at a glance.</p>
        </div>
        <a class="btn btn-primary" routerLink="/analyze"><i class="bi bi-bullseye me-1"></i>Analyze a match</a>
      </div>

      @if (summary(); as s) {
        @if (isNewUser(s)) {
          <div class="ap-card ap-animate p-4 p-md-5 mb-4" style="background:linear-gradient(135deg,#eef2ff,#fff);">
            <h4 class="fw-bold mb-1">Welcome aboard, {{ firstName() }} 👋</h4>
            <p class="text-secondary mb-4">Three quick steps and you'll have your first match score:</p>
            <div class="row g-3">
              <div class="col-md-4">
                <a class="ap-card ap-card-interactive d-block p-3 h-100 text-body" routerLink="/resumes/new">
                  <div class="d-flex align-items-center gap-2 mb-1"><span class="badge text-bg-primary rounded-circle">1</span><span class="fw-semibold">Add your resume</span></div>
                  <div class="small text-secondary">Upload a PDF or paste the text.</div>
                </a>
              </div>
              <div class="col-md-4">
                <a class="ap-card ap-card-interactive d-block p-3 h-100 text-body" routerLink="/jobs/new">
                  <div class="d-flex align-items-center gap-2 mb-1"><span class="badge text-bg-primary rounded-circle">2</span><span class="fw-semibold">Add a job</span></div>
                  <div class="small text-secondary">Paste a job description you like.</div>
                </a>
              </div>
              <div class="col-md-4">
                <a class="ap-card ap-card-interactive d-block p-3 h-100 text-body" routerLink="/analyze">
                  <div class="d-flex align-items-center gap-2 mb-1"><span class="badge text-bg-primary rounded-circle">3</span><span class="fw-semibold">Analyze the match</span></div>
                  <div class="small text-secondary">Get your score + tailored docs.</div>
                </a>
              </div>
            </div>
          </div>
        }
        <div class="row g-3 mb-4">
          <div class="col-6 col-lg-2">
            <div class="ap-card ap-stat ap-animate"><i class="bi bi-send ap-stat-icon text-primary"></i><div class="ap-stat-value">{{ s.totalApplications }}</div><div class="ap-stat-label">Total Applications</div></div>
          </div>
          <div class="col-6 col-lg-2">
            <div class="ap-card ap-stat ap-animate"><i class="bi bi-bullseye ap-stat-icon text-primary"></i><div class="ap-stat-value text-primary">{{ s.averageMatchScore }}</div><div class="ap-stat-label">Avg Match Score</div></div>
          </div>
          <div class="col-6 col-lg-2">
            <div class="ap-card ap-stat ap-animate"><i class="bi bi-alarm ap-stat-icon text-warning"></i><div class="ap-stat-value">{{ s.followUpsDue }}</div><div class="ap-stat-label">Follow-ups Due</div></div>
          </div>
          <div class="col-6 col-lg-2">
            <div class="ap-card ap-stat ap-animate"><i class="bi bi-chat-dots ap-stat-icon text-info"></i><div class="ap-stat-value">{{ s.interviews }}</div><div class="ap-stat-label">Interviews</div></div>
          </div>
          <div class="col-6 col-lg-2">
            <div class="ap-card ap-stat ap-animate"><i class="bi bi-trophy ap-stat-icon text-success"></i><div class="ap-stat-value text-success">{{ s.offers }}</div><div class="ap-stat-label">Offers</div></div>
          </div>
          <div class="col-6 col-lg-2">
            <div class="ap-card ap-stat ap-animate"><i class="bi bi-x-circle ap-stat-icon text-danger"></i><div class="ap-stat-value text-danger">{{ s.rejections }}</div><div class="ap-stat-label">Rejections</div></div>
          </div>
        </div>

        <div class="row g-4">
          <div class="col-lg-4">
            <div class="ap-card p-4 h-100">
              <h6 class="fw-bold mb-3">Top Missing Skills</h6>
              @if (s.topMissingSkills.length) {
                @for (skill of s.topMissingSkills; track skill.skill) {
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="ap-keyword missing mb-0">{{ skill.skill }}</span>
                    <span class="badge text-bg-light">{{ skill.count }}x</span>
                  </div>
                }
              } @else {
                <p class="text-secondary small mb-0">Run a match analysis to surface skill gaps.</p>
              }
            </div>
          </div>

          <div class="col-lg-4">
            <div class="ap-card p-4 h-100">
              <div class="d-flex justify-content-between mb-3">
                <h6 class="fw-bold mb-0">Recent Match Reports</h6>
                <span class="badge text-bg-light">Highest: {{ s.highestMatchScore }}</span>
              </div>
              @if (s.recentMatchReports.length) {
                @for (r of s.recentMatchReports; track r.id) {
                  <a class="d-flex justify-content-between align-items-center text-decoration-none text-body py-2 border-bottom" [routerLink]="['/reports', r.id]">
                    <div><div class="fw-semibold">{{ r.jobTitle }}</div><div class="small text-secondary">{{ r.companyName }}</div></div>
                    <span class="badge" [class]="scoreBadge(r.matchScore)">{{ r.matchScore }}</span>
                  </a>
                }
              } @else {
                <p class="text-secondary small mb-0">No reports yet.</p>
              }
            </div>
          </div>

          <div class="col-lg-4">
            <div class="ap-card p-4 h-100">
              <h6 class="fw-bold mb-3">Recent Applications</h6>
              @if (s.recentApplications.length) {
                @for (a of s.recentApplications; track a.id) {
                  <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <div><div class="fw-semibold">{{ a.jobTitle }}</div><div class="small text-secondary">{{ a.companyName }}</div></div>
                    <span class="badge text-bg-light">{{ a.status }}</span>
                  </div>
                }
              } @else {
                <p class="text-secondary small mb-2">No applications yet.</p>
                <a class="btn btn-sm btn-outline-primary" routerLink="/applications/new">Add application</a>
              }
            </div>
          </div>
        </div>
      } @else if (loading()) {
        <div class="text-center py-5"><span class="spinner-border text-primary"></span></div>
      } @else if (error()) {
        <div class="alert alert-danger">{{ error() }}</div>
      }
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  private dashboard = inject(DashboardService);
  private auth = inject(AuthService);

  loading = signal(true);
  error = signal<string | null>(null);
  summary = signal<DashboardSummary | null>(null);

  firstName(): string {
    return this.auth.user()?.fullName?.split(' ')[0] ?? 'there';
  }

  isNewUser(s: DashboardSummary): boolean {
    return s.totalApplications === 0 && s.recentMatchReports.length === 0;
  }

  ngOnInit(): void {
    this.dashboard.summary().subscribe({
      next: (s) => {
        this.summary.set(s);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load dashboard.');
        this.loading.set(false);
      },
    });
  }

  scoreBadge(score: number): string {
    if (score >= 75) return 'text-bg-success';
    if (score >= 50) return 'text-bg-warning';
    return 'text-bg-danger';
  }
}
