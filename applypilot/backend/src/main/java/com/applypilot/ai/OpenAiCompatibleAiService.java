package com.applypilot.ai;

import com.applypilot.config.ApplyPilotProperties;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * AI provider implementation that talks to any OpenAI-compatible
 * {@code /chat/completions} endpoint. When no API key is configured, or the
 * provider call fails, it gracefully falls back to {@link FallbackKeywordAnalyzer}
 * and deterministic document templates so the application never crashes.
 */
@Slf4j
@Service
public class OpenAiCompatibleAiService implements AiService {

    private final ApplyPilotProperties props;
    private final FallbackKeywordAnalyzer fallback;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestClient restClient;

    public OpenAiCompatibleAiService(ApplyPilotProperties props, FallbackKeywordAnalyzer fallback) {
        this.props = props;
        this.fallback = fallback;
        this.restClient = RestClient.builder()
                .baseUrl(props.getAi().getBaseUrl())
                .build();
    }

    @Override
    public boolean isAiEnabled() {
        return props.getAi().isConfigured();
    }

    @Override
    public AiAnalysisResult analyzeResumeAgainstJob(String resumeText, String jobDescriptionText) {
        if (!isAiEnabled()) {
            log.info("AI disabled (no AI_API_KEY) - using fallback keyword analysis.");
            return fallback.analyze(resumeText, jobDescriptionText);
        }
        try {
            String prompt = buildAnalysisPrompt(resumeText, jobDescriptionText);
            String content = callChat(
                    "You are an expert technical recruiter and ATS optimization assistant. "
                            + "Always respond with a single valid JSON object and nothing else.",
                    prompt);
            AiAnalysisResult result = parseAnalysis(content);
            if (result != null) {
                result.setAiGenerated(true);
                result.setRawAiResponse(content);
                return result;
            }
            log.warn("AI returned unparseable analysis JSON - falling back.");
        } catch (Exception e) {
            log.warn("AI analysis call failed ({}) - falling back to keyword analysis.", e.getMessage());
        }
        // Merge: keep deterministic keyword data, but flag as non-AI.
        return fallback.analyze(resumeText, jobDescriptionText);
    }

    @Override
    public String generateCoverLetter(String resumeText, String jobDescriptionText, String companyName, String jobTitle) {
        String prompt = "Write a concise, professional cover letter (max 320 words) for the role of "
                + safe(jobTitle) + " at " + safe(companyName) + ". Use the candidate resume and job description. "
                + "Return only the letter text.\n\nRESUME:\n" + safe(resumeText)
                + "\n\nJOB DESCRIPTION:\n" + safe(jobDescriptionText);
        return callOrFallback(prompt, () -> FallbackDocuments.coverLetter(companyName, jobTitle));
    }

    @Override
    public String generateRecruiterMessage(String resumeText, String jobDescriptionText, String companyName, String jobTitle) {
        String prompt = "Write a short LinkedIn message (max 90 words) to a recruiter expressing interest in the "
                + safe(jobTitle) + " role at " + safe(companyName) + ". Friendly, professional, specific. Return only the message.\n\n"
                + "RESUME:\n" + safe(resumeText) + "\n\nJOB DESCRIPTION:\n" + safe(jobDescriptionText);
        return callOrFallback(prompt, () -> FallbackDocuments.recruiterMessage(companyName, jobTitle));
    }

    @Override
    public String generateFollowUpEmail(String companyName, String jobTitle) {
        String prompt = "Write a polite follow-up email (max 130 words) checking on the status of my application "
                + "for the " + safe(jobTitle) + " role at " + safe(companyName) + ". Return only the email.";
        return callOrFallback(prompt, () -> FallbackDocuments.followUpEmail(companyName, jobTitle));
    }

    @Override
    public String generateThankYouEmail(String companyName, String jobTitle) {
        String prompt = "Write a warm thank-you email (max 130 words) after interviewing for the " + safe(jobTitle)
                + " role at " + safe(companyName) + ". Return only the email.";
        return callOrFallback(prompt, () -> FallbackDocuments.thankYouEmail(companyName, jobTitle));
    }

    @Override
    public String generateColdEmail(String resumeText, String companyName, String jobTitle) {
        String prompt = "Write a short cold email (max 120 words) to a recruiter at " + safe(companyName)
                + " introducing myself for the " + safe(jobTitle) + " role. Return only the email.\n\nRESUME:\n" + safe(resumeText);
        return callOrFallback(prompt, () -> FallbackDocuments.coldEmail(companyName, jobTitle));
    }

    // ---- internal ----

    private interface FallbackSupplier {
        String get();
    }

    private String callOrFallback(String prompt, FallbackSupplier fb) {
        if (!isAiEnabled()) {
            return fb.get();
        }
        try {
            String content = callChat("You are a helpful career assistant. Return only the requested text.", prompt);
            if (content != null && !content.isBlank()) {
                return content.trim();
            }
        } catch (Exception e) {
            log.warn("AI document generation failed ({}) - using template.", e.getMessage());
        }
        return fb.get();
    }

    @SuppressWarnings("unchecked")
    private String callChat(String systemPrompt, String userPrompt) {
        Map<String, Object> body = Map.of(
                "model", props.getAi().getModel(),
                "temperature", 0.4,
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", userPrompt)
                )
        );

        Map<String, Object> response = restClient.post()
                .uri("/chat/completions")
                .header("Authorization", "Bearer " + props.getAi().getApiKey())
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(Map.class);

        if (response == null) {
            return null;
        }
        List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
        if (choices == null || choices.isEmpty()) {
            return null;
        }
        Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
        return message == null ? null : (String) message.get("content");
    }

    private AiAnalysisResult parseAnalysis(String content) {
        if (content == null) {
            return null;
        }
        String json = extractJson(content);
        if (json == null) {
            return null;
        }
        try {
            JsonNode node = objectMapper.readTree(json);
            return AiAnalysisResult.builder()
                    .matchScore(clampScore(node.path("matchScore").asInt(0)))
                    .matchedKeywords(toList(node.get("matchedKeywords")))
                    .missingKeywords(toList(node.get("missingKeywords")))
                    .importantSkills(toList(node.get("importantSkills")))
                    .strengths(toList(node.get("strengths")))
                    .gaps(toList(node.get("gaps")))
                    .suggestedSummary(node.path("suggestedSummary").asText(null))
                    .optimizedBullets(toList(node.get("optimizedBullets")))
                    .coverLetter(node.path("coverLetter").asText(null))
                    .recruiterMessage(node.path("recruiterMessage").asText(null))
                    .followUpEmail(node.path("followUpEmail").asText(null))
                    .interviewQuestions(toList(node.get("interviewQuestions")))
                    .build();
        } catch (Exception e) {
            log.warn("Failed to parse AI JSON: {}", e.getMessage());
            return null;
        }
    }

    /** Extract the first {@code {...}} JSON block, tolerating markdown fences / prose. */
    private String extractJson(String content) {
        int start = content.indexOf('{');
        int end = content.lastIndexOf('}');
        if (start < 0 || end < 0 || end <= start) {
            return null;
        }
        return content.substring(start, end + 1);
    }

    private List<String> toList(JsonNode node) {
        List<String> out = new ArrayList<>();
        if (node != null && node.isArray()) {
            node.forEach(n -> {
                String v = n.asText(null);
                if (v != null && !v.isBlank()) {
                    out.add(v.trim());
                }
            });
        }
        return out;
    }

    private int clampScore(int score) {
        return Math.max(0, Math.min(100, score));
    }

    private String buildAnalysisPrompt(String resumeText, String jobDescriptionText) {
        return """
                Analyse the following resume against the job description and respond with a single JSON object
                using EXACTLY these keys: matchScore (0-100 integer), matchedKeywords (array of strings),
                missingKeywords (array of strings), importantSkills (array of strings), strengths (array of strings),
                gaps (array of strings), suggestedSummary (string), optimizedBullets (array of strings),
                coverLetter (string), recruiterMessage (string), followUpEmail (string),
                interviewQuestions (array of strings). Do not include any text outside the JSON.

                RESUME:
                %s

                JOB DESCRIPTION:
                %s
                """.formatted(safe(resumeText), safe(jobDescriptionText));
    }

    private static String safe(String s) {
        return s == null ? "" : s;
    }
}
