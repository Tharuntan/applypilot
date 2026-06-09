import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatchService } from '../core/match.service';
import { ApplicationService } from '../core/application.service';
import { downloadTextPdf } from '../core/pdf.util';
import { MatchReport } from '../core/models';

@Component({
  selector: 'app-match-report',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container py-4" style="max-width: 920px;">
      <a class="text-decoration-none small text-secondary" routerLink="/analyze"><i class="bi bi-arrow-left"></i> New analysis</a>

      @if (report(); as r) {
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mt-2 mb-4">
          <div>
            <h3 class="fw-bold mb-0">{{ r.jobTitle }}</h3>
            <p class="text-secondary mb-0">{{ r.companyName }} · resume: {{ r.resumeTitle }}</p>
          </div>
          <div class="d-flex align-items-center gap-3">
            <span class="badge" [class]="r.aiGenerated ? 'text-bg-primary' : 'text-bg-secondary'">
              {{ r.aiGenerated ? 'AI analysis' : 'Keyword analysis' }}
            </span>
            <button class="btn btn-primary" (click)="saveAsApplication(r)" [disabled]="saving()">
              @if (saving()) { <span class="spinner-border spinner-border-sm me-1"></span> }
              <i class="bi bi-bookmark-plus me-1"></i> Save as application
            </button>
          </div>
        </div>

        @if (saved()) {
          <div class="alert alert-success">Saved to your application tracker. <a routerLink="/applications">View tracker</a></div>
        }

        <div class="row g-4">
          <div class="col-md-4">
            <div class="ap-card p-4 text-center h-100">
              <div class="ap-score-ring mx-auto mb-3" [style.background]="scoreColor(r.matchScore)">{{ r.matchScore }}</div>
              <h6 class="fw-bold mb-1">Match Score</h6>
              <p class="text-secondary small mb-0">{{ scoreLabel(r.matchScore) }}</p>
            </div>
          </div>
          <div class="col-md-8">
            <div class="ap-card p-4 h-100">
              <h6 class="fw-bold mb-3">Keywords</h6>
              <div class="mb-2">
                <div class="small text-secondary mb-1">Matched ({{ r.matchedKeywords.length }})</div>
                @for (k of r.matchedKeywords; track k) { <span class="ap-keyword matched">{{ k }}</span> }
                @if (!r.matchedKeywords.length) { <span class="text-secondary small">None</span> }
              </div>
              <div>
                <div class="small text-secondary mb-1">Missing ({{ r.missingKeywords.length }})</div>
                @for (k of r.missingKeywords; track k) { <span class="ap-keyword missing">{{ k }}</span> }
                @if (!r.missingKeywords.length) { <span class="text-secondary small">None — great coverage!</span> }
              </div>
            </div>
          </div>

          <div class="col-md-6">
            <div class="ap-card p-4 h-100">
              <h6 class="fw-bold mb-3"><i class="bi bi-check-circle text-success me-1"></i>Strengths</h6>
              <ul class="mb-0 ps-3">@for (s of r.strengths; track s) { <li class="mb-1">{{ s }}</li> }</ul>
            </div>
          </div>
          <div class="col-md-6">
            <div class="ap-card p-4 h-100">
              <h6 class="fw-bold mb-3"><i class="bi bi-exclamation-triangle text-warning me-1"></i>Gaps</h6>
              <ul class="mb-0 ps-3">@for (g of r.gaps; track g) { <li class="mb-1">{{ g }}</li> }</ul>
            </div>
          </div>

          <div class="col-12">
            <div class="ap-card p-4">
              <h6 class="fw-bold mb-2">Suggested Summary</h6>
              <p class="ap-doc-content mb-0">{{ r.suggestedSummary }}</p>
            </div>
          </div>

          <div class="col-12">
            <div class="ap-card p-4">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="fw-bold mb-0">Optimized Bullet Points</h6>
                <button class="btn btn-sm btn-outline-primary" (click)="downloadResumePdf(r)"><i class="bi bi-filetype-pdf me-1"></i>Download optimized resume</button>
              </div>
              <ul class="mb-0 ps-3">@for (b of r.optimizedBullets; track b) { <li class="mb-2">{{ b }}</li> }</ul>
            </div>
          </div>

          @for (doc of docSections(r); track doc.title) {
            <div class="col-12">
              <div class="ap-card p-4">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <h6 class="fw-bold mb-0">{{ doc.title }}</h6>
                  <div class="d-flex gap-1">
                    <button class="btn btn-sm btn-outline-secondary" (click)="copy(doc.content)"><i class="bi bi-clipboard me-1"></i>Copy</button>
                    <button class="btn btn-sm btn-outline-primary" (click)="downloadPdf(doc.title, doc.content)"><i class="bi bi-filetype-pdf me-1"></i>PDF</button>
                  </div>
                </div>
                <p class="ap-doc-content mb-0">{{ doc.content }}</p>
              </div>
            </div>
          }

          <div class="col-12">
            <div class="ap-card p-4">
              <h6 class="fw-bold mb-3">Interview Preparation</h6>
              <ol class="mb-0 ps-3">@for (q of r.interviewQuestions; track q) { <li class="mb-2">{{ q }}</li> }</ol>
            </div>
          </div>
        </div>
      } @else if (loading()) {
        <div class="text-center py-5"><span class="spinner-border text-primary"></span></div>
      } @else if (error()) {
        <div class="alert alert-danger mt-4">{{ error() }}</div>
      }
    </div>
  `,
})
export class MatchReportComponent implements OnInit {
  private matchService = inject(MatchService);
  private applicationService = inject(ApplicationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  loading = signal(true);
  saving = signal(false);
  saved = signal(false);
  error = signal<string | null>(null);
  report = signal<MatchReport | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.matchService.report(id).subscribe({
      next: (r) => {
        this.report.set(r);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Match report not found.');
        this.loading.set(false);
      },
    });
  }

  docSections(r: MatchReport): { title: string; content: string }[] {
    return [
      { title: 'Cover Letter', content: r.coverLetter },
      { title: 'LinkedIn Recruiter Message', content: r.recruiterMessage },
      { title: 'Follow-up Email', content: r.followUpEmail },
    ].filter((d) => !!d.content);
  }

  saveAsApplication(r: MatchReport): void {
    this.saving.set(true);
    this.applicationService
      .create({
        companyName: r.companyName,
        jobTitle: r.jobTitle,
        status: 'SAVED',
        resumeId: r.resumeId,
        jobDescriptionId: r.jobDescriptionId,
        matchReportId: r.id,
        applicationDate: new Date().toISOString().slice(0, 10),
      })
      .subscribe({
        next: () => {
          this.saved.set(true);
          this.saving.set(false);
        },
        error: () => this.saving.set(false),
      });
  }

  copy(text: string): void {
    navigator.clipboard?.writeText(text);
  }

  downloadPdf(title: string, content: string): void {
    const r = this.report();
    const suffix = r ? ` - ${r.jobTitle} @ ${r.companyName}` : '';
    downloadTextPdf(title + suffix, content, title + suffix);
  }

  downloadResumePdf(r: MatchReport): void {
    const body =
      'PROFESSIONAL SUMMARY\n' +
      (r.suggestedSummary || '') +
      '\n\nKEY ACHIEVEMENTS\n' +
      r.optimizedBullets.map((b) => '• ' + b).join('\n');
    downloadTextPdf(`Optimized Resume - ${r.jobTitle}`, body, `optimized_resume_${r.jobTitle}`);
  }

  scoreColor(score: number): string {
    if (score >= 75) return '#0f7a3d';
    if (score >= 50) return '#b88217';
    return '#b42318';
  }

  scoreLabel(score: number): string {
    if (score >= 75) return 'Strong fit — apply with confidence.';
    if (score >= 50) return 'Moderate fit — close the keyword gaps.';
    return 'Low fit — tailor your resume before applying.';
  }
}
