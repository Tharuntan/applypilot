import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="ap-hero py-5">
      <div class="container py-5">
        <div class="row align-items-center g-5">
          <div class="col-lg-6 ap-animate">
            <span class="badge rounded-pill text-bg-light border mb-3">For IT &amp; software job seekers</span>
            <h1 class="display-4 fw-bold mb-3" style="letter-spacing:-0.03em;">Apply smarter, not harder.</h1>
            <p class="fs-5 text-secondary mb-4">
              Match your resume to any job description, generate better application materials, and track every
              job application in one dashboard.
            </p>
            <div class="d-flex gap-3">
              <a class="btn btn-primary btn-lg px-4" routerLink="/register">Start Free</a>
              <a class="btn btn-outline-primary btn-lg px-4" routerLink="/login">Login</a>
            </div>
          </div>
          <div class="col-lg-6">
            <div class="ap-card p-4">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="mb-0 text-secondary">Match score</h6>
                <span class="badge text-bg-success">Strong fit</span>
              </div>
              <div class="d-flex align-items-center gap-3 mb-3">
                <div class="ap-score-ring" style="background:#0f7a3d;">86</div>
                <div>
                  <div class="mb-1"><span class="ap-keyword matched">Java</span><span class="ap-keyword matched">Spring Boot</span><span class="ap-keyword matched">Angular</span></div>
                  <div><span class="ap-keyword missing">Kubernetes</span><span class="ap-keyword missing">AWS ECS</span></div>
                </div>
              </div>
              <p class="small text-secondary mb-0">
                ApplyPilot analyses the gap between your resume and the role, then drafts your cover letter,
                recruiter message, and follow-up email automatically.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="container py-5">
      <div class="text-center mb-5">
        <h2 class="fw-bold">Everything you need to apply smarter</h2>
        <p class="text-secondary">From a raw resume to a tracked application — in one place.</p>
      </div>
      <div class="row g-4">
        <div class="col-md-4">
          <div class="ap-card ap-card-interactive p-4 h-100">
            <div class="d-inline-flex align-items-center justify-content-center rounded-3 mb-3" style="width:48px;height:48px;background:var(--ap-primary-soft);"><i class="bi bi-bullseye fs-4 text-primary"></i></div>
            <h5>ATS Match Score</h5>
            <p class="text-secondary mb-0">See exactly which keywords you match and which you're missing for any role.</p>
          </div>
        </div>
        <div class="col-md-4">
          <div class="ap-card ap-card-interactive p-4 h-100">
            <div class="d-inline-flex align-items-center justify-content-center rounded-3 mb-3" style="width:48px;height:48px;background:var(--ap-primary-soft);"><i class="bi bi-magic fs-4 text-primary"></i></div>
            <h5>AI Application Docs</h5>
            <p class="text-secondary mb-0">Generate cover letters, recruiter messages, and follow-up emails in one click.</p>
          </div>
        </div>
        <div class="col-md-4">
          <div class="ap-card ap-card-interactive p-4 h-100">
            <div class="d-inline-flex align-items-center justify-content-center rounded-3 mb-3" style="width:48px;height:48px;background:var(--ap-primary-soft);"><i class="bi bi-kanban fs-4 text-primary"></i></div>
            <h5>Application Tracker</h5>
            <p class="text-secondary mb-0">Track every application from Saved to Offer, with follow-up reminders.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="container pb-5">
      <div class="ap-card p-4 p-md-5" style="background:linear-gradient(135deg,#4f46e5,#6366f1);">
        <div class="row align-items-center text-white g-3">
          <div class="col-md-8">
            <h3 class="fw-bold mb-1 text-white">Ready to land your next role?</h3>
            <p class="mb-0 opacity-75">Upload your resume, paste a job, and get your match score in under a minute.</p>
          </div>
          <div class="col-md-4 text-md-end">
            <a class="btn btn-light btn-lg px-4 fw-semibold" routerLink="/register">Get started — it's free</a>
          </div>
        </div>
      </div>
    </section>

    <footer class="border-top py-4">
      <div class="container text-center text-secondary small">
        ApplyPilot — an MVP job application platform. Built with Spring Boot &amp; Angular.
      </div>
    </footer>
  `,
})
export class LandingComponent {}
