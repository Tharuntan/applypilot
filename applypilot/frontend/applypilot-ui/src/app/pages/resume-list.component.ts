import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ResumeService } from '../core/resume.service';
import { Resume } from '../core/models';

@Component({
  selector: 'app-resume-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 class="fw-bold mb-0">My Resumes</h3>
          <p class="text-secondary mb-0">Manage multiple resume versions for different roles.</p>
        </div>
        <a class="btn btn-primary" routerLink="/resumes/new"><i class="bi bi-plus-lg me-1"></i>New Resume</a>
      </div>

      @if (loading()) {
        <div class="text-center py-5"><span class="spinner-border text-primary"></span></div>
      } @else if (resumes().length === 0) {
        <div class="ap-card p-5 text-center">
          <i class="bi bi-file-earmark-text fs-1 text-secondary"></i>
          <h5 class="mt-3">No resumes yet</h5>
          <p class="text-secondary">Add your first resume by pasting its content.</p>
          <a class="btn btn-primary" routerLink="/resumes/new">Add resume</a>
        </div>
      } @else {
        <div class="row g-3">
          @for (r of resumes(); track r.id) {
            <div class="col-md-6 col-lg-4">
              <div class="ap-card p-4 h-100 d-flex flex-column">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <h6 class="fw-bold mb-0">{{ r.title }}</h6>
                  @if (r.primaryResume) {
                    <span class="badge text-bg-primary">Primary</span>
                  }
                </div>
                <p class="text-secondary small flex-grow-1">{{ r.content | slice: 0 : 160 }}{{ r.content.length > 160 ? '…' : '' }}</p>
                <div class="d-flex gap-2 mt-2">
                  <a class="btn btn-sm btn-outline-primary" [routerLink]="['/resumes', r.id, 'edit']">Edit</a>
                  @if (!r.primaryResume) {
                    <button class="btn btn-sm btn-outline-secondary" (click)="makePrimary(r.id)">Set primary</button>
                  }
                  <button class="btn btn-sm btn-outline-danger ms-auto" (click)="remove(r)"><i class="bi bi-trash"></i></button>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class ResumeListComponent implements OnInit {
  private service = inject(ResumeService);

  loading = signal(true);
  resumes = signal<Resume[]>([]);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.service.list().subscribe({
      next: (r) => {
        this.resumes.set(r);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  makePrimary(id: number): void {
    this.service.makePrimary(id).subscribe(() => this.load());
  }

  remove(r: Resume): void {
    if (confirm(`Delete resume "${r.title}"?`)) {
      this.service.delete(r.id).subscribe(() => this.load());
    }
  }
}
