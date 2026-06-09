import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../core/dashboard.service';
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
        <div class="row g-3 mb-4">
          <div class="col-6 col-lg-2">
            <div class="ap-card ap-stat"><div class="ap-stat-value">{{ s.totalApplications }}</div><div class="ap-stat-label">Total Applications</div></div>
          </div>
          <div class="col-6 col-lg-2">
            <div class="ap-card ap-stat"><div class="ap-stat-value text-primary">{{ s.averageMatchScore }}</div><div class="ap-stat-label">Avg Match Score</div></div>
          </div>
          <div class="col-6 col-lg-2">
            <div class="ap-card ap-stat"><div class="ap-stat-value">{{ s.followUpsDue }}</div><div class="ap-stat-label">Follow-ups Due</div></div>
          </div>
          <div class="col-6 col-lg-2">
            <div class="ap-card ap-stat"><div class="ap-stat-value">{{ s.interviews }}</div><div class="ap-stat-label">Interviews</div></div>
          </div>
          <div class="col-6 col-lg-2">
            <div class="ap-card ap-stat"><div class="ap-stat-value text-success">{{ s.offers }}</div><div class="ap-stat-label">Offers</div></div>
          </div>
          <div class="col-6 col-lg-2">
            <div class="ap-card ap-stat"><div class="ap-stat-value text-danger">{{ s.rejections }}</div><div class="ap-stat-label">Rejections</div></div>
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

  loading = signal(true);
  error = signal<string | null>(null);
  summary = signal<DashboardSummary | null>(null);

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
