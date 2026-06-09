package com.applypilot.service;

import com.applypilot.domain.*;
import com.applypilot.dto.ApplicationDtos.*;
import com.applypilot.exception.NotFoundException;
import com.applypilot.repository.JobApplicationRepository;
import com.applypilot.security.CurrentUserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ApplicationService {

    private final JobApplicationRepository repository;
    private final ResumeService resumeService;
    private final JobDescriptionService jobDescriptionService;
    private final MatchService matchService;
    private final CurrentUserService currentUser;

    public ApplicationService(JobApplicationRepository repository,
                              ResumeService resumeService,
                              JobDescriptionService jobDescriptionService,
                              MatchService matchService,
                              CurrentUserService currentUser) {
        this.repository = repository;
        this.resumeService = resumeService;
        this.jobDescriptionService = jobDescriptionService;
        this.matchService = matchService;
        this.currentUser = currentUser;
    }

    @Transactional(readOnly = true)
    public List<ApplicationResponse> list(ApplicationStatus status) {
        User user = currentUser.require();
        List<JobApplication> apps = (status == null)
                ? repository.findByUserOrderByCreatedAtDesc(user)
                : repository.findByUserAndStatusOrderByCreatedAtDesc(user, status);
        return apps.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ApplicationResponse get(Long id) {
        return toResponse(requireOwned(id));
    }

    @Transactional
    public ApplicationResponse create(ApplicationRequest req) {
        User user = currentUser.require();
        JobApplication app = JobApplication.builder()
                .user(user)
                .companyName(req.companyName().trim())
                .jobTitle(req.jobTitle().trim())
                .jobUrl(req.jobUrl())
                .location(req.location())
                .salaryRange(req.salaryRange())
                .applicationDate(req.applicationDate())
                .followUpDate(req.followUpDate())
                .status(req.status() != null ? req.status() : ApplicationStatus.SAVED)
                .notes(req.notes())
                .resume(resolveResume(req.resumeId()))
                .jobDescription(resolveJd(req.jobDescriptionId()))
                .matchReport(resolveMatchReport(req.matchReportId()))
                .build();
        return toResponse(repository.save(app));
    }

    @Transactional
    public ApplicationResponse update(Long id, ApplicationRequest req) {
        JobApplication app = requireOwned(id);
        app.setCompanyName(req.companyName().trim());
        app.setJobTitle(req.jobTitle().trim());
        app.setJobUrl(req.jobUrl());
        app.setLocation(req.location());
        app.setSalaryRange(req.salaryRange());
        app.setApplicationDate(req.applicationDate());
        app.setFollowUpDate(req.followUpDate());
        if (req.status() != null) {
            app.setStatus(req.status());
        }
        app.setNotes(req.notes());
        app.setResume(resolveResume(req.resumeId()));
        app.setJobDescription(resolveJd(req.jobDescriptionId()));
        app.setMatchReport(resolveMatchReport(req.matchReportId()));
        return toResponse(repository.save(app));
    }

    @Transactional
    public ApplicationResponse updateStatus(Long id, ApplicationStatus status) {
        JobApplication app = requireOwned(id);
        app.setStatus(status);
        return toResponse(repository.save(app));
    }

    @Transactional
    public void delete(Long id) {
        repository.delete(requireOwned(id));
    }

    // ---- internal ----

    JobApplication requireOwned(Long id) {
        return repository.findByIdAndUser(id, currentUser.require())
                .orElseThrow(() -> new NotFoundException("Application not found: " + id));
    }

    private Resume resolveResume(Long id) {
        return id == null ? null : resumeService.requireOwned(id);
    }

    private JobDescription resolveJd(Long id) {
        return id == null ? null : jobDescriptionService.requireOwned(id);
    }

    private MatchReport resolveMatchReport(Long id) {
        return id == null ? null : matchService.requireOwned(id);
    }

    ApplicationResponse toResponse(JobApplication a) {
        Resume resume = a.getResume();
        MatchReport mr = a.getMatchReport();
        return new ApplicationResponse(
                a.getId(),
                a.getCompanyName(),
                a.getJobTitle(),
                a.getJobUrl(),
                a.getLocation(),
                a.getSalaryRange(),
                a.getApplicationDate(),
                a.getFollowUpDate(),
                a.getStatus(),
                a.getNotes(),
                resume != null ? resume.getId() : null,
                resume != null ? resume.getTitle() : null,
                a.getJobDescription() != null ? a.getJobDescription().getId() : null,
                mr != null ? mr.getId() : null,
                mr != null ? mr.getMatchScore() : null,
                a.getCreatedAt(),
                a.getUpdatedAt());
    }
}
