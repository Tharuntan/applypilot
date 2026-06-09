import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { downloadTextPdf } from '../core/pdf.util';
import { DocumentService } from '../core/document.service';
import { ResumeService } from '../core/resume.service';
import { JobDescriptionService } from '../core/job-description.service';
import {
  DOCUMENT_TYPES,
  DocumentType,
  GeneratedDocument,
  JobDescription,
  Resume,
} from '../core/models';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container py-4">
      <h3 class="fw-bold mb-1">Generated Documents</h3>
      <p class="text-secondary mb-4">Generate and store cover letters, recruiter messages, and emails.</p>

      <div class="row g-4">
        <div class="col-lg-4">
          <div class="ap-card p-4">
            <h6 class="fw-bold mb-3">Generate new</h6>
            @if (error()) { <div class="alert alert-danger py-2">{{ error() }}</div> }
            <div class="mb-3">
              <label class="form-label">Document type</label>
              <select class="form-select" [(ngModel)]="docType">
                @for (t of docTypes; track t.value) { <option [ngValue]="t.value">{{ t.label }}</option> }
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Resume <span class="text-secondary">(optional)</span></label>
              <select class="form-select" [(ngModel)]="resumeId">
                <option [ngValue]="null">— none —</option>
                @for (r of resumes(); track r.id) { <option [ngValue]="r.id">{{ r.title }}</option> }
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Job <span class="text-secondary">(optional)</span></label>
              <select class="form-select" [(ngModel)]="jobId">
                <option [ngValue]="null">— none —</option>
                @for (j of jobs(); track j.id) { <option [ngValue]="j.id">{{ j.jobTitle }} — {{ j.companyName }}</option> }
              </select>
            </div>
            <button class="btn btn-primary w-100" (click)="generate()" [disabled]="generating()">
              @if (generating()) { <span class="spinner-border spinner-border-sm me-2"></span> }
              <i class="bi bi-magic me-1"></i> Generate
            </button>
          </div>
        </div>

        <div class="col-lg-8">
          @if (loading()) {
            <div class="text-center py-5"><span class="spinner-border text-primary"></span></div>
          } @else if (documents().length === 0) {
            <div class="ap-card p-5 text-center">
              <i class="bi bi-file-earmark-text fs-1 text-secondary"></i>
              <h5 class="mt-3">No documents yet</h5>
              <p class="text-secondary mb-0">Generate your first document on the left.</p>
            </div>
          } @else {
            <div class="d-flex flex-column gap-3">
              @for (d of documents(); track d.id) {
                <div class="ap-card p-4">
                  <div class="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <span class="badge text-bg-light mb-1">{{ typeLabel(d.documentType) }}</span>
                      <h6 class="fw-bold mb-0">{{ d.title }}</h6>
                    </div>
                    <div class="d-flex gap-1">
                      <button class="btn btn-sm btn-outline-secondary" title="Copy" (click)="copy(d.content)"><i class="bi bi-clipboard"></i></button>
                      <button class="btn btn-sm btn-outline-primary" title="Download PDF" (click)="downloadPdf(d)"><i class="bi bi-filetype-pdf"></i></button>
                      <button class="btn btn-sm btn-outline-danger" title="Delete" (click)="remove(d)"><i class="bi bi-trash"></i></button>
                    </div>
                  </div>
                  <p class="ap-doc-content mb-0">{{ d.content }}</p>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class DocumentsComponent implements OnInit {
  private docService = inject(DocumentService);
  private resumeService = inject(ResumeService);
  private jobService = inject(JobDescriptionService);

  docTypes = DOCUMENT_TYPES;
  loading = signal(true);
  generating = signal(false);
  error = signal<string | null>(null);
  documents = signal<GeneratedDocument[]>([]);
  resumes = signal<Resume[]>([]);
  jobs = signal<JobDescription[]>([]);

  docType: DocumentType = 'COVER_LETTER';
  resumeId: number | null = null;
  jobId: number | null = null;

  ngOnInit(): void {
    forkJoin({
      docs: this.docService.list(),
      resumes: this.resumeService.list(),
      jobs: this.jobService.list(),
    }).subscribe({
      next: ({ docs, resumes, jobs }) => {
        this.documents.set(docs);
        this.resumes.set(resumes);
        this.jobs.set(jobs);
        this.resumeId = resumes.find((r) => r.primaryResume)?.id ?? null;
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  generate(): void {
    this.generating.set(true);
    this.error.set(null);
    this.docService
      .generate({ documentType: this.docType, resumeId: this.resumeId, jobDescriptionId: this.jobId })
      .subscribe({
        next: (doc) => {
          this.documents.update((list) => [doc, ...list]);
          this.generating.set(false);
        },
        error: (err) => {
          this.error.set(err?.error?.message ?? 'Generation failed.');
          this.generating.set(false);
        },
      });
  }

  remove(d: GeneratedDocument): void {
    if (confirm(`Delete "${d.title}"?`)) {
      this.docService.delete(d.id).subscribe(() => this.documents.update((l) => l.filter((x) => x.id !== d.id)));
    }
  }

  copy(text: string): void {
    navigator.clipboard?.writeText(text);
  }

  downloadPdf(d: GeneratedDocument): void {
    downloadTextPdf(d.title, d.content, d.title);
  }

  typeLabel(type: DocumentType): string {
    return this.docTypes.find((t) => t.value === type)?.label ?? type;
  }
}
