package com.applypilot.ai;

/**
 * Abstraction over the AI provider. Implementations must never throw on provider
 * failure for analysis; instead they should fall back to deterministic output so
 * the application keeps working without an API key.
 */
public interface AiService {

    /** Full resume-vs-job analysis. */
    AiAnalysisResult analyzeResumeAgainstJob(String resumeText, String jobDescriptionText);

    String generateCoverLetter(String resumeText, String jobDescriptionText, String companyName, String jobTitle);

    String generateRecruiterMessage(String resumeText, String jobDescriptionText, String companyName, String jobTitle);

    String generateFollowUpEmail(String companyName, String jobTitle);

    String generateThankYouEmail(String companyName, String jobTitle);

    String generateColdEmail(String resumeText, String companyName, String jobTitle);

    /** True when a real AI provider is configured (API key present). */
    boolean isAiEnabled();
}
