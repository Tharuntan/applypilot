package com.applypilot.service;

import com.applypilot.ai.AiService;
import com.applypilot.domain.*;
import com.applypilot.dto.DocumentDtos.*;
import com.applypilot.exception.NotFoundException;
import com.applypilot.repository.GeneratedDocumentRepository;
import com.applypilot.security.CurrentUserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DocumentService {

    private final GeneratedDocumentRepository repository;
    private final ResumeService resumeService;
    private final JobDescriptionService jobDescriptionService;
    private final ApplicationService applicationService;
    private final AiService aiService;
    private final CurrentUserService currentUser;

    public DocumentService(GeneratedDocumentRepository repository,
                           ResumeService resumeService,
                           JobDescriptionService jobDescriptionService,
                           ApplicationService applicationService,
                           AiService aiService,
                           CurrentUserService currentUser) {
        this.repository = repository;
        this.resumeService = resumeService;
        this.jobDescriptionService = jobDescriptionService;
        this.applicationService = applicationService;
        this.aiService = aiService;
        this.currentUser = currentUser;
    }

    @Transactional
    public DocumentResponse generate(GenerateDocumentRequest req) {
        User user = currentUser.require();

        String resumeText = req.resumeText();
        String jobText = req.jobDescriptionText();
        String company = req.companyName();
        String jobTitle = req.jobTitle();
        JobApplication application = null;

        if (req.resumeId() != null) {
            Resume resume = resumeService.requireOwned(req.resumeId());
            if (resumeText == null || resumeText.isBlank()) {
                resumeText = resume.getContent();
            }
        }
        if (req.jobDescriptionId() != null) {
            JobDescription jd = jobDescriptionService.requireOwned(req.jobDescriptionId());
            if (jobText == null || jobText.isBlank()) {
                jobText = jd.getDescriptionText();
            }
            if (company == null || company.isBlank()) {
                company = jd.getCompanyName();
            }
            if (jobTitle == null || jobTitle.isBlank()) {
                jobTitle = jd.getJobTitle();
            }
        }
        if (req.jobApplicationId() != null) {
            application = applicationService.requireOwned(req.jobApplicationId());
            if (company == null || company.isBlank()) {
                company = application.getCompanyName();
            }
            if (jobTitle == null || jobTitle.isBlank()) {
                jobTitle = application.getJobTitle();
            }
        }

        String content = switch (req.documentType()) {
            case COVER_LETTER -> aiService.generateCoverLetter(nz(resumeText), nz(jobText), company, jobTitle);
            case RECRUITER_MESSAGE -> aiService.generateRecruiterMessage(nz(resumeText), nz(jobText), company, jobTitle);
            case FOLLOW_UP_EMAIL -> aiService.generateFollowUpEmail(company, jobTitle);
            case THANK_YOU_EMAIL -> aiService.generateThankYouEmail(company, jobTitle);
            case COLD_EMAIL -> aiService.generateColdEmail(nz(resumeText), company, jobTitle);
        };

        String title = (req.title() != null && !req.title().isBlank())
                ? req.title().trim()
                : defaultTitle(req.documentType(), company, jobTitle);

        GeneratedDocument doc = GeneratedDocument.builder()
                .user(user)
                .jobApplication(application)
                .documentType(req.documentType())
                .title(title)
                .content(content)
                .build();
        return toResponse(repository.save(doc));
    }

    @Transactional(readOnly = true)
    public List<DocumentResponse> list() {
        return repository.findByUserOrderByCreatedAtDesc(currentUser.require())
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public DocumentResponse get(Long id) {
        return toResponse(requireOwned(id));
    }

    @Transactional
    public void delete(Long id) {
        repository.delete(requireOwned(id));
    }

    private GeneratedDocument requireOwned(Long id) {
        return repository.findByIdAndUser(id, currentUser.require())
                .orElseThrow(() -> new NotFoundException("Document not found: " + id));
    }

    private String defaultTitle(DocumentType type, String company, String jobTitle) {
        String label = switch (type) {
            case COVER_LETTER -> "Cover Letter";
            case RECRUITER_MESSAGE -> "Recruiter Message";
            case FOLLOW_UP_EMAIL -> "Follow-up Email";
            case THANK_YOU_EMAIL -> "Thank-you Email";
            case COLD_EMAIL -> "Cold Email";
        };
        String suffix = (jobTitle != null && !jobTitle.isBlank()) ? " - " + jobTitle : "";
        if (company != null && !company.isBlank()) {
            suffix += " @ " + company;
        }
        return label + suffix;
    }

    private static String nz(String s) {
        return s == null ? "" : s;
    }

    private DocumentResponse toResponse(GeneratedDocument d) {
        return new DocumentResponse(
                d.getId(),
                d.getDocumentType(),
                d.getTitle(),
                d.getContent(),
                d.getJobApplication() != null ? d.getJobApplication().getId() : null,
                aiService.isAiEnabled(),
                d.getCreatedAt(),
                d.getUpdatedAt());
    }
}
