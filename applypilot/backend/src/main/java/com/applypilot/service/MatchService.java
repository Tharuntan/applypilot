package com.applypilot.service;

import com.applypilot.ai.AiAnalysisResult;
import com.applypilot.ai.AiService;
import com.applypilot.domain.JobDescription;
import com.applypilot.domain.MatchReport;
import com.applypilot.domain.Resume;
import com.applypilot.domain.User;
import com.applypilot.dto.MatchDtos.*;
import com.applypilot.exception.NotFoundException;
import com.applypilot.repository.MatchReportRepository;
import com.applypilot.security.CurrentUserService;
import com.applypilot.support.JsonLists;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MatchService {

    private final MatchReportRepository matchReportRepository;
    private final ResumeService resumeService;
    private final JobDescriptionService jobDescriptionService;
    private final AiService aiService;
    private final CurrentUserService currentUser;

    public MatchService(MatchReportRepository matchReportRepository,
                        ResumeService resumeService,
                        JobDescriptionService jobDescriptionService,
                        AiService aiService,
                        CurrentUserService currentUser) {
        this.matchReportRepository = matchReportRepository;
        this.resumeService = resumeService;
        this.jobDescriptionService = jobDescriptionService;
        this.aiService = aiService;
        this.currentUser = currentUser;
    }

    @Transactional
    public MatchReportResponse analyze(AnalyzeRequest request) {
        User user = currentUser.require();
        Resume resume = resumeService.requireOwned(request.resumeId());
        JobDescription jd = jobDescriptionService.requireOwned(request.jobDescriptionId());

        AiAnalysisResult result = aiService.analyzeResumeAgainstJob(resume.getContent(), jd.getDescriptionText());

        // Ensure the report always carries the application documents, falling back to templates.
        String coverLetter = orGenerate(result.getCoverLetter(),
                () -> aiService.generateCoverLetter(resume.getContent(), jd.getDescriptionText(),
                        jd.getCompanyName(), jd.getJobTitle()));
        String recruiterMessage = orGenerate(result.getRecruiterMessage(),
                () -> aiService.generateRecruiterMessage(resume.getContent(), jd.getDescriptionText(),
                        jd.getCompanyName(), jd.getJobTitle()));
        String followUpEmail = orGenerate(result.getFollowUpEmail(),
                () -> aiService.generateFollowUpEmail(jd.getCompanyName(), jd.getJobTitle()));

        MatchReport report = MatchReport.builder()
                .user(user)
                .resume(resume)
                .jobDescription(jd)
                .matchScore(result.getMatchScore())
                .matchedKeywords(JsonLists.toJson(result.getMatchedKeywords()))
                .missingKeywords(JsonLists.toJson(result.getMissingKeywords()))
                .importantSkills(JsonLists.toJson(result.getImportantSkills()))
                .strengths(JsonLists.toJson(result.getStrengths()))
                .gaps(JsonLists.toJson(result.getGaps()))
                .suggestedSummary(result.getSuggestedSummary())
                .optimizedBullets(JsonLists.toJson(result.getOptimizedBullets()))
                .coverLetter(coverLetter)
                .recruiterMessage(recruiterMessage)
                .followUpEmail(followUpEmail)
                .interviewQuestions(JsonLists.toJson(result.getInterviewQuestions()))
                .rawAiResponse(result.getRawAiResponse())
                .aiGenerated(result.isAiGenerated())
                .build();

        return toResponse(matchReportRepository.save(report));
    }

    @Transactional(readOnly = true)
    public List<MatchReportResponse> list() {
        return matchReportRepository.findByUserOrderByCreatedAtDesc(currentUser.require())
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public MatchReportResponse get(Long id) {
        return toResponse(requireOwned(id));
    }

    @Transactional
    public void delete(Long id) {
        matchReportRepository.delete(requireOwned(id));
    }

    MatchReport requireOwned(Long id) {
        return matchReportRepository.findByIdAndUser(id, currentUser.require())
                .orElseThrow(() -> new NotFoundException("Match report not found: " + id));
    }

    private interface Generator {
        String generate();
    }

    private String orGenerate(String existing, Generator generator) {
        if (existing != null && !existing.isBlank()) {
            return existing;
        }
        return generator.generate();
    }

    MatchReportResponse toResponse(MatchReport r) {
        return new MatchReportResponse(
                r.getId(),
                r.getResume().getId(),
                r.getResume().getTitle(),
                r.getJobDescription().getId(),
                r.getJobDescription().getCompanyName(),
                r.getJobDescription().getJobTitle(),
                r.getMatchScore(),
                JsonLists.fromJson(r.getMatchedKeywords()),
                JsonLists.fromJson(r.getMissingKeywords()),
                JsonLists.fromJson(r.getImportantSkills()),
                JsonLists.fromJson(r.getStrengths()),
                JsonLists.fromJson(r.getGaps()),
                r.getSuggestedSummary(),
                JsonLists.fromJson(r.getOptimizedBullets()),
                r.getCoverLetter(),
                r.getRecruiterMessage(),
                r.getFollowUpEmail(),
                JsonLists.fromJson(r.getInterviewQuestions()),
                r.isAiGenerated(),
                r.getCreatedAt());
    }
}
