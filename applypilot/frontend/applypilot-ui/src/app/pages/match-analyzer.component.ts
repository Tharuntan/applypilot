import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ResumeService } from '../core/resume.service';
import { JobDescriptionService } from '../core/job-description.service';
import { MatchService } from '../core/match.service';
import { JobDescription, Resume } from '../core/models';

@Component({
  selector: 'app-match-analyzer',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container py-4" style="max-width: 760px;">
      <h3 class="fw-bold mb-1">Analyze Match</h3>
      <p class="text-secondary mb-4">Pick a resume and a job description to score your fit and generate documents.</p>

      @if (error()) {
        <div class="alert alert-danger">{{ error() }}</div>
      }

      @if (loading()) {
        <div class="text-center py-5"><span class="spinner-border text-primary"></span></div>
      } @else if (resumes().length === 0 || jobs().length === 0) {
        <div class="ap-card p-4">
          <p class="mb-3">You need at least one resume and one job description to run an analysis.</p>
          <div class="d-flex gap-2">
            @if (resumes().length === 0) { <a class="btn btn-outline-primary" routerLink="/resumes/new">Add resume</a> }
            @if (jobs().length === 0) { <a class="btn btn-outline-primary" routerLink="/jobs/new">Add job</a> }
          </div>
        </div>
      } @else {
        <div class="ap-card p-4">
          <div class="mb-3">
            <label class="form-label">Resume</label>
            <select class="form-select" [(ngModel)]="resumeId">
              @for (r of resumes(); track r.id) {
                <option [ngValue]="r.id">{{ r.title }}{{ r.primaryResume ? ' (primary)' : '' }}</option>
              }
            </select>
          </div>
          <div class="mb-4">
            <label class="form-label">Job description</label>
            <select class="form-select" [(ngModel)]="jobId">
              @for (j of jobs(); track j.id) {
                <option [ngValue]="j.id">{{ j.jobTitle }} — {{ j.companyName }}</option>
              }
            </select>
          </div>
          <button class="btn btn-primary btn-lg w-100" (click)="analyze()" [disabled]="analyzing() || !resumeId || !jobId">
            @if (analyzing()) {
              <span class="spinner-border spinner-border-sm me-2"></span> Analyzing…
            } @else {
              <i class="bi bi-bullseye me-1"></i> Analyze Match
            }
          </button>
          <p class="text-secondary small text-center mt-3 mb-0">
            Uses AI when configured, otherwise a built-in keyword analyzer. Either way you get a score, keyword
            gaps, and draft documents.
          </p>
        </div>
      }
    </div>
  `,
})
export class MatchAnalyzerComponent implements OnInit {
  private resumeService = inject(ResumeService);
  private jobService = inject(JobDescriptionService);
  private matchService = inject(MatchService);
  private router = inject(Router);

  loading = signal(true);
  analyzing = signal(false);
  error = signal<string | null>(null);
  resumes = signal<Resume[]>([]);
  jobs = signal<JobDescription[]>([]);

  resumeId: number | null = null;
  jobId: number | null = null;

  ngOnInit(): void {
    forkJoin({ resumes: this.resumeService.list(), jobs: this.jobService.list() }).subscribe({
      next: ({ resumes, jobs }) => {
        this.resumes.set(resumes);
        this.jobs.set(jobs);
        this.resumeId = resumes.find((r) => r.primaryResume)?.id ?? resumes[0]?.id ?? null;
        this.jobId = jobs[0]?.id ?? null;
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load your resumes and jobs.');
        this.loading.set(false);
      },
    });
  }

  analyze(): void {
    if (!this.resumeId || !this.jobId) return;
    this.analyzing.set(true);
    this.error.set(null);
    this.matchService.analyze(this.resumeId, this.jobId).subscribe({
      next: (report) => this.router.navigate(['/reports', report.id]),
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Analysis failed. Please try again.');
        this.analyzing.set(false);
      },
    });
  }
}
