import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ResumeService } from '../core/resume.service';

@Component({
  selector: 'app-resume-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container py-4" style="max-width: 820px;">
      <a class="text-decoration-none small text-secondary" routerLink="/resumes"><i class="bi bi-arrow-left"></i> Back to resumes</a>
      <h3 class="fw-bold mt-2 mb-4">{{ id ? 'Edit Resume' : 'New Resume' }}</h3>

      @if (error()) {
        <div class="alert alert-danger">{{ error() }}</div>
      }

      <div class="ap-card p-4 mb-3 border-primary-subtle" style="border-style:dashed;">
        <div class="d-flex align-items-center gap-3 flex-wrap">
          <div class="flex-grow-1">
            <h6 class="fw-bold mb-1"><i class="bi bi-cloud-arrow-up me-1 text-primary"></i>Upload a file instead of pasting</h6>
            <p class="text-secondary small mb-0">PDF, DOCX, DOC or TXT (max 5 MB). We'll extract the text — you can edit it before saving.</p>
          </div>
          <div>
            <input #fileInput type="file" class="d-none" accept=".pdf,.doc,.docx,.txt,.rtf" (change)="onFile($event)" />
            <button type="button" class="btn btn-outline-primary" (click)="fileInput.click()" [disabled]="uploading()">
              @if (uploading()) { <span class="spinner-border spinner-border-sm me-2"></span>Reading… }
              @else { <i class="bi bi-upload me-1"></i>Choose file }
            </button>
          </div>
        </div>
        @if (uploadMsg()) { <div class="alert alert-success py-2 mb-0 mt-3">{{ uploadMsg() }}</div> }
      </div>

      <form class="ap-card p-4" [formGroup]="form" (ngSubmit)="submit()">
        <div class="mb-3">
          <label class="form-label">Title</label>
          <input class="form-control" formControlName="title" placeholder="e.g. Java Full Stack Resume" />
        </div>
        <div class="mb-3">
          <label class="form-label">Resume content</label>
          <textarea class="form-control ap-mono" rows="16" formControlName="content"
            placeholder="Paste your full resume text here…"></textarea>
        </div>
        <div class="form-check mb-4">
          <input class="form-check-input" type="checkbox" id="primary" formControlName="primaryResume" />
          <label class="form-check-label" for="primary">Mark as primary resume</label>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-primary" type="submit" [disabled]="form.invalid || saving()">
            @if (saving()) { <span class="spinner-border spinner-border-sm me-2"></span> }
            Save
          </button>
          <a class="btn btn-outline-secondary" routerLink="/resumes">Cancel</a>
        </div>
      </form>
    </div>
  `,
})
export class ResumeEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(ResumeService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  id: number | null = null;
  saving = signal(false);
  uploading = signal(false);
  uploadMsg = signal<string | null>(null);
  error = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    title: ['', [Validators.required]],
    content: ['', [Validators.required]],
    primaryResume: [false],
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.id = Number(idParam);
      this.service.get(this.id).subscribe((r) =>
        this.form.patchValue({ title: r.title, content: r.content, primaryResume: r.primaryResume }),
      );
    }
  }

  onFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.uploading.set(true);
    this.uploadMsg.set(null);
    this.error.set(null);
    this.service.extractFromFile(file).subscribe({
      next: (res) => {
        this.form.patchValue({
          content: res.content,
          title: this.form.controls.title.value?.trim() ? this.form.controls.title.value : res.title,
        });
        this.uploadMsg.set(`Imported "${file.name}" — review the text below and save.`);
        this.uploading.set(false);
        input.value = '';
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Could not read that file.');
        this.uploading.set(false);
        input.value = '';
      },
    });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.error.set(null);
    const body = this.form.getRawValue();
    const op = this.id ? this.service.update(this.id, body) : this.service.create(body);
    op.subscribe({
      next: () => this.router.navigate(['/resumes']),
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Could not save resume.');
        this.saving.set(false);
      },
    });
  }
}
