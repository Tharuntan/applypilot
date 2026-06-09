import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApplicationService } from '../core/application.service';
import { APPLICATION_STATUSES } from '../core/models';

@Component({
  selector: 'app-application-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container py-4" style="max-width: 760px;">
      <a class="text-decoration-none small text-secondary" routerLink="/applications"><i class="bi bi-arrow-left"></i> Back to tracker</a>
      <h3 class="fw-bold mt-2 mb-4">{{ id ? 'Edit Application' : 'New Application' }}</h3>

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
            <input class="form-control" formControlName="jobUrl" />
          </div>
          <div class="col-md-6">
            <label class="form-label">Location</label>
            <input class="form-control" formControlName="location" />
          </div>
          <div class="col-md-6">
            <label class="form-label">Salary range</label>
            <input class="form-control" formControlName="salaryRange" />
          </div>
          <div class="col-md-6">
            <label class="form-label">Status</label>
            <select class="form-select" formControlName="status">
              @for (s of statuses; track s) { <option [value]="s">{{ label(s) }}</option> }
            </select>
          </div>
          <div class="col-md-6">
            <label class="form-label">Application date</label>
            <input type="date" class="form-control" formControlName="applicationDate" />
          </div>
          <div class="col-md-6">
            <label class="form-label">Follow-up date</label>
            <input type="date" class="form-control" formControlName="followUpDate" />
          </div>
          <div class="col-12">
            <label class="form-label">Notes</label>
            <textarea class="form-control" rows="4" formControlName="notes" placeholder="Recruiter name, next steps, etc."></textarea>
          </div>
        </div>
        <div class="d-flex gap-2 mt-4">
          <button class="btn btn-primary" type="submit" [disabled]="form.invalid || saving()">
            @if (saving()) { <span class="spinner-border spinner-border-sm me-2"></span> }
            Save
          </button>
          <a class="btn btn-outline-secondary" routerLink="/applications">Cancel</a>
        </div>
      </form>
    </div>
  `,
})
export class ApplicationEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(ApplicationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  statuses = APPLICATION_STATUSES;
  id: number | null = null;
  saving = signal(false);
  error = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    companyName: ['', [Validators.required]],
    jobTitle: ['', [Validators.required]],
    jobUrl: [''],
    location: [''],
    salaryRange: [''],
    status: ['SAVED'],
    applicationDate: [''],
    followUpDate: [''],
    notes: [''],
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.id = Number(idParam);
      this.service.get(this.id).subscribe((a) =>
        this.form.patchValue({
          companyName: a.companyName,
          jobTitle: a.jobTitle,
          jobUrl: a.jobUrl ?? '',
          location: a.location ?? '',
          salaryRange: a.salaryRange ?? '',
          status: a.status,
          applicationDate: a.applicationDate ?? '',
          followUpDate: a.followUpDate ?? '',
          notes: a.notes ?? '',
        }),
      );
    }
  }

  submit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.error.set(null);
    const v = this.form.getRawValue();
    const body = {
      companyName: v.companyName,
      jobTitle: v.jobTitle,
      jobUrl: v.jobUrl || undefined,
      location: v.location || undefined,
      salaryRange: v.salaryRange || undefined,
      status: v.status as any,
      applicationDate: v.applicationDate || null,
      followUpDate: v.followUpDate || null,
      notes: v.notes || undefined,
    };
    const op = this.id ? this.service.update(this.id, body) : this.service.create(body);
    op.subscribe({
      next: () => this.router.navigate(['/applications']),
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Could not save application.');
        this.saving.set(false);
      },
    });
  }

  label(status: string): string {
    return status.replace('_', ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  }
}
