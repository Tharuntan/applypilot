package com.applypilot.service;

import com.applypilot.domain.JobDescription;
import com.applypilot.dto.JobDescriptionDtos.*;
import com.applypilot.exception.NotFoundException;
import com.applypilot.repository.JobDescriptionRepository;
import com.applypilot.security.CurrentUserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class JobDescriptionService {

    private final JobDescriptionRepository repository;
    private final CurrentUserService currentUser;

    public JobDescriptionService(JobDescriptionRepository repository, CurrentUserService currentUser) {
        this.repository = repository;
        this.currentUser = currentUser;
    }

    @Transactional(readOnly = true)
    public List<JobDescriptionResponse> list() {
        return repository.findByUserOrderByUpdatedAtDesc(currentUser.require())
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public JobDescriptionResponse get(Long id) {
        return toResponse(requireOwned(id));
    }

    @Transactional
    public JobDescriptionResponse create(JobDescriptionRequest req) {
        JobDescription jd = JobDescription.builder()
                .user(currentUser.require())
                .companyName(req.companyName().trim())
                .jobTitle(req.jobTitle().trim())
                .jobUrl(blankToNull(req.jobUrl()))
                .location(blankToNull(req.location()))
                .employmentType(blankToNull(req.employmentType()))
                .salaryRange(blankToNull(req.salaryRange()))
                .descriptionText(req.descriptionText())
                .build();
        return toResponse(repository.save(jd));
    }

    @Transactional
    public JobDescriptionResponse update(Long id, JobDescriptionRequest req) {
        JobDescription jd = requireOwned(id);
        jd.setCompanyName(req.companyName().trim());
        jd.setJobTitle(req.jobTitle().trim());
        jd.setJobUrl(blankToNull(req.jobUrl()));
        jd.setLocation(blankToNull(req.location()));
        jd.setEmploymentType(blankToNull(req.employmentType()));
        jd.setSalaryRange(blankToNull(req.salaryRange()));
        jd.setDescriptionText(req.descriptionText());
        return toResponse(repository.save(jd));
    }

    @Transactional
    public void delete(Long id) {
        repository.delete(requireOwned(id));
    }

    JobDescription requireOwned(Long id) {
        return repository.findByIdAndUser(id, currentUser.require())
                .orElseThrow(() -> new NotFoundException("Job description not found: " + id));
    }

    private static String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }

    JobDescriptionResponse toResponse(JobDescription jd) {
        return new JobDescriptionResponse(jd.getId(), jd.getCompanyName(), jd.getJobTitle(),
                jd.getJobUrl(), jd.getLocation(), jd.getEmploymentType(), jd.getSalaryRange(),
                jd.getDescriptionText(), jd.getCreatedAt(), jd.getUpdatedAt());
    }
}
