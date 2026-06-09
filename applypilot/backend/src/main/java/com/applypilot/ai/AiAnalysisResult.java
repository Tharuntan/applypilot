package com.applypilot.ai;

import lombok.Builder;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

/**
 * Normalised result of analysing a resume against a job description.
 * Produced either by the AI provider or by the fallback keyword analyzer.
 */
@Data
@Builder
public class AiAnalysisResult {

    private int matchScore;
    @Builder.Default
    private List<String> matchedKeywords = new ArrayList<>();
    @Builder.Default
    private List<String> missingKeywords = new ArrayList<>();
    @Builder.Default
    private List<String> importantSkills = new ArrayList<>();
    @Builder.Default
    private List<String> strengths = new ArrayList<>();
    @Builder.Default
    private List<String> gaps = new ArrayList<>();
    private String suggestedSummary;
    @Builder.Default
    private List<String> optimizedBullets = new ArrayList<>();
    private String coverLetter;
    private String recruiterMessage;
    private String followUpEmail;
    @Builder.Default
    private List<String> interviewQuestions = new ArrayList<>();

    /** Raw text returned by the AI provider (null for fallback). */
    private String rawAiResponse;

    /** True when the AI provider produced this result, false for fallback. */
    private boolean aiGenerated;
}
