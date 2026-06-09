import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { JobDescriptionService } from '../core/job-description.service';
import { JobDescription } from '../core/models';

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 class="fw-bold mb-0">Job Descriptions</h3>
          <p class="text-secondary mb-0">Save roles you want to apply to.</p>
        </div>
        <a class="btn btn-primary" routerLink="/jobs/new"><i class="bi bi-plus-lg me-1"></i>New Job</a>
      </div>

      @if (loading()) {
        <div class="text-center py-5"><span class="spinner-border text-primary"></span></div>
      } @else if (jobs().length === 0) {
        <div class="ap-card p-5 text-center">
          <i class="bi bi-briefcase fs-1 text-secondary"></i>
          <h5 class="mt-3">No job descriptions yet</h5>
          <p class="text-secondary">Paste a job description to analyse it against your resume.</p>
          <a class="btn btn-primary" routerLink="/jobs/new">Add job description</a>
        </div>
      } @else {
        <div class="ap-card">
          <div class="table-responsive">
            <table class="table align-middle mb-0">
              <thead class="table-light">
                <tr><th>Company</th><th>Title</th><th>Location</th><th>Type</th><th class="text-end">Actions</th></tr>
              </thead>
              <tbody>
                @for (j of jobs(); track j.id) {
                  <tr>
                    <td class="fw-semibold">{{ j.companyName }}</td>
                    <td>{{ j.jobTitle }}</td>
                    <td class="text-secondary">{{ j.location || '—' }}</td>
                    <td class="text-secondary">{{ j.employmentType || '—' }}</td>
                    <td class="text-end">
                      <a class="btn btn-sm btn-outline-primary" [routerLink]="['/jobs', j.id, 'edit']">Edit</a>
                      <button class="btn btn-sm btn-outline-danger ms-1" (click)="remove(j)"><i class="bi bi-trash"></i></button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `,
})
export class JobListComponent implements OnInit {
  private service = inject(JobDescriptionService);

  loading = signal(true);
  jobs = signal<JobDescription[]>([]);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.service.list().subscribe({
      next: (j) => {
        this.jobs.set(j);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  remove(j: JobDescription): void {
    if (confirm(`Delete job "${j.jobTitle}" at ${j.companyName}?`)) {
      this.service.delete(j.id).subscribe(() => this.load());
    }
  }
}
