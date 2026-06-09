package com.applypilot.dto;

import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.List;

public final class MatchDtos {

    private MatchDtos() {
    }

    public record AnalyzeRequest(
            @NotNull Long resumeId,
            @NotNull Long jobDescriptionId
    ) {
    }

    public record MatchReportResponse(
            Long id,
            Long resumeId,
            String resumeTitle,
            Long jobDescriptionId,
            String companyName,
            String jobTitle,
            int matchScore,
            List<String> matchedKeywords,
            List<String> missingKeywords,
            List<String> importantSkills,
            List<String> strengths,
            List<String> gaps,
            String suggestedSummary,
            List<String> optimizedBullets,
            String coverLetter,
            String recruiterMessage,
            String followUpEmail,
            List<String> interviewQuestions,
            boolean aiGenerated,
            Instant createdAt
    ) {
    }
}
