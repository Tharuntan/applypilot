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
