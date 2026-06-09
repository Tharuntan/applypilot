import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { JobDescriptionService } from '../core/job-description.service';

@Component({
  selector: 'app-job-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container py-4" style="max-width: 820px;">
      <a class="text-decoration-none small text-secondary" routerLink="/jobs"><i class="bi bi-arrow-left"></i> Back to jobs</a>
      <h3 class="fw-bold mt-2 mb-4">{{ id ? 'Edit Job Description' : 'New Job Description' }}</h3>

      @if (error()) {
        <div class="alert alert-danger">{{ error() }}</div>
      }

      <form class="ap-card p-4" [formGroup]="form" (ngSubmit)="submit()">
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">Company name</label>
            <input class="form-control" formControlName="companyName" />
          </div>
          <div class="col-md-6">
            <label class="form-label">Job title</label>
            <input class="form-control" formControlName="jobTitle" />
          </div>
          <div class="col-md-6">
            <label class="form-label">Job URL</label>
            <input class="form-control" formControlName="jobUrl" placeholder="https://…" />
          </div>
          <div class="col-md-6">
            <label class="form-label">Location</label>
            <input class="form-control" formControlName="location" placeholder="Remote / City" />
          </div>
          <div class="col-md-6">
            <label class="form-label">Employment type</label>
            <input class="form-control" formControlName="employmentType" placeholder="Full-time / Contract" />
          </div>
          <div class="col-md-6">
            <label class="form-label">Salary range</label>
            <input class="form-control" formControlName="salaryRange" placeholder="$120k – $150k" />
          </div>
          <div class="col-12">
            <label class="form-label">Job description</label>
            <textarea class="form-control ap-mono" rows="12" formControlName="descriptionText"
              placeholder="Paste the full job description here…"></textarea>
          </div>
        </div>
        <div class="d-flex gap-2 mt-4">
          <button class="btn btn-primary" type="submit" [disabled]="form.invalid || saving()">
            @if (saving()) { <span class="spinner-border spinner-border-sm me-2"></span> }
            Save
          </button>
          <a class="btn btn-outline-secondary" routerLink="/jobs">Cancel</a>
        </div>
      </form>
    </div>
  `,
})
export class JobEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(JobDescriptionService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  id: number | null = null;
  saving = signal(false);
  error = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    companyName: ['', [Validators.required]],
    jobTitle: ['', [Validators.required]],
    jobUrl: [''],
    location: [''],
    employmentType: [''],
    salaryRange: [''],
    descriptionText: ['', [Validators.required]],
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.id = Number(idParam);
      this.service.get(this.id).subscribe((j) =>
        this.form.patchValue({
          companyName: j.companyName,
          jobTitle: j.jobTitle,
          jobUrl: j.jobUrl ?? '',
          location: j.location ?? '',
          employmentType: j.employmentType ?? '',
          salaryRange: j.salaryRange ?? '',
          descriptionText: j.descriptionText,
        }),
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
      next: () => this.router.navigate(['/jobs']),
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Could not save job description.');
        this.saving.set(false);
      },
    });
  }
}
