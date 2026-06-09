import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApplicationService } from '../core/application.service';
import { APPLICATION_STATUSES, ApplicationStatus, JobApplication } from '../core/models';

@Component({
  selector: 'app-application-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container-fluid py-4 px-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 class="fw-bold mb-0">Application Tracker</h3>
          <p class="text-secondary mb-0">{{ applications().length }} applications tracked.</p>
        </div>
        <div class="d-flex gap-2">
          <div class="btn-group">
            <button class="btn btn-outline-secondary" [class.active]="view() === 'board'" (click)="view.set('board')"><i class="bi bi-kanban"></i></button>
            <button class="btn btn-outline-secondary" [class.active]="view() === 'table'" (click)="view.set('table')"><i class="bi bi-table"></i></button>
          </div>
          <a class="btn btn-primary" routerLink="/applications/new"><i class="bi bi-plus-lg me-1"></i>Add</a>
        </div>
      </div>

      @if (loading()) {
        <div class="text-center py-5"><span class="spinner-border text-primary"></span></div>
      } @else if (view() === 'board') {
        <div class="d-flex gap-3 overflow-auto pb-3">
          @for (status of statuses; track status) {
            <div class="ap-kanban-col flex-shrink-0" style="width: 250px;">
              <div class="d-flex justify-content-between align-items-center mb-2 px-1">
                <span class="fw-semibold small">{{ label(status) }}</span>
                <span class="badge text-bg-light">{{ byStatus(status).length }}</span>
              </div>
              <div class="d-flex flex-column gap-2">
                @for (a of byStatus(status); track a.id) {
                  <div class="ap-card p-3">
                    <div class="fw-semibold">{{ a.jobTitle }}</div>
                    <div class="small text-secondary mb-2">{{ a.companyName }}</div>
                    @if (a.matchScore != null) {
                      <span class="badge text-bg-light mb-2">Match {{ a.matchScore }}</span>
                    }
                    <div class="d-flex gap-1 align-items-center">
                      <select class="form-select form-select-sm" [value]="a.status" (change)="changeStatus(a, $any($event.target).value)">
                        @for (s of statuses; track s) { <option [value]="s">{{ label(s) }}</option> }
                      </select>
                      <a class="btn btn-sm btn-outline-secondary" [routerLink]="['/applications', a.id, 'edit']"><i class="bi bi-pencil"></i></a>
                    </div>
                  </div>
                }
                @if (byStatus(status).length === 0) {
                  <div class="text-secondary small px-1">—</div>
                }
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="ap-card">
          <div class="table-responsive">
            <table class="table align-middle mb-0">
              <thead class="table-light">
                <tr><th>Company</th><th>Title</th><th>Status</th><th>Applied</th><th>Follow-up</th><th>Match</th><th class="text-end">Actions</th></tr>
              </thead>
              <tbody>
                @for (a of applications(); track a.id) {
                  <tr>
                    <td class="fw-semibold">{{ a.companyName }}</td>
                    <td>{{ a.jobTitle }}</td>
                    <td><span class="badge text-bg-light">{{ label(a.status) }}</span></td>
                    <td class="text-secondary small">{{ a.applicationDate || '—' }}</td>
                    <td class="text-secondary small">{{ a.followUpDate || '—' }}</td>
                    <td>{{ a.matchScore != null ? a.matchScore : '—' }}</td>
                    <td class="text-end">
                      <a class="btn btn-sm btn-outline-primary" [routerLink]="['/applications', a.id, 'edit']">Edit</a>
                      <button class="btn btn-sm btn-outline-danger ms-1" (click)="remove(a)"><i class="bi bi-trash"></i></button>
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
export class ApplicationListComponent implements OnInit {
  private service = inject(ApplicationService);

  statuses = APPLICATION_STATUSES;
  loading = signal(true);
  view = signal<'board' | 'table'>('board');
  applications = signal<JobApplication[]>([]);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.service.list().subscribe({
      next: (a) => {
        this.applications.set(a);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  byStatus(status: ApplicationStatus): JobApplication[] {
    return this.applications().filter((a) => a.status === status);
  }

  changeStatus(a: JobApplication, status: ApplicationStatus): void {
    this.service.updateStatus(a.id, status).subscribe(() => this.load());
  }

  remove(a: JobApplication): void {
    if (confirm(`Delete application for ${a.jobTitle} at ${a.companyName}?`)) {
      this.service.delete(a.id).subscribe(() => this.load());
    }
  }

  label(status: string): string {
    return status.replace('_', ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  }
}
