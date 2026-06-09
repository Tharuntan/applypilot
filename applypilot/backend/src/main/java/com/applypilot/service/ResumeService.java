package com.applypilot.service;

import com.applypilot.domain.Resume;
import com.applypilot.domain.User;
import com.applypilot.dto.ResumeDtos.*;
import com.applypilot.exception.NotFoundException;
import com.applypilot.repository.ResumeRepository;
import com.applypilot.security.CurrentUserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final CurrentUserService currentUser;

    public ResumeService(ResumeRepository resumeRepository, CurrentUserService currentUser) {
        this.resumeRepository = resumeRepository;
        this.currentUser = currentUser;
    }

    @Transactional(readOnly = true)
    public List<ResumeResponse> list() {
        return resumeRepository.findByUserOrderByUpdatedAtDesc(currentUser.require())
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ResumeResponse get(Long id) {
        return toResponse(requireOwned(id));
    }

    @Transactional
    public ResumeResponse create(ResumeRequest request) {
        User user = currentUser.require();
        boolean primary = Boolean.TRUE.equals(request.primaryResume());
        if (primary) {
            clearPrimary(user);
        } else if (resumeRepository.countByUser(user) == 0) {
            primary = true; // first resume becomes primary automatically
        }
        Resume resume = Resume.builder()
                .user(user)
                .title(request.title().trim())
                .content(request.content())
                .primaryResume(primary)
                .build();
        return toResponse(resumeRepository.save(resume));
    }

    @Transactional
    public ResumeResponse update(Long id, ResumeRequest request) {
        Resume resume = requireOwned(id);
        resume.setTitle(request.title().trim());
        resume.setContent(request.content());
        if (Boolean.TRUE.equals(request.primaryResume()) && !resume.isPrimaryResume()) {
            clearPrimary(resume.getUser());
            resume.setPrimaryResume(true);
        }
        return toResponse(resumeRepository.save(resume));
    }

    @Transactional
    public ResumeResponse makePrimary(Long id) {
        Resume resume = requireOwned(id);
        clearPrimary(resume.getUser());
        resume.setPrimaryResume(true);
        return toResponse(resumeRepository.save(resume));
    }

    @Transactional
    public void delete(Long id) {
        Resume resume = requireOwned(id);
        resumeRepository.delete(resume);
    }

    // ---- internal ----

    Resume requireOwned(Long id) {
        return resumeRepository.findByIdAndUser(id, currentUser.require())
                .orElseThrow(() -> new NotFoundException("Resume not found: " + id));
    }

    private void clearPrimary(User user) {
        for (Resume r : resumeRepository.findByUserAndPrimaryResumeTrue(user)) {
            r.setPrimaryResume(false);
            resumeRepository.save(r);
        }
    }

    ResumeResponse toResponse(Resume r) {
        return new ResumeResponse(r.getId(), r.getTitle(), r.getContent(),
                r.isPrimaryResume(), r.getCreatedAt(), r.getUpdatedAt());
    }
}
