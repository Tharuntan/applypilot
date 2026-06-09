package com.applypilot.ai;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

/**
 * Deterministic, AI-free analysis based on the {@link TechKeywordDictionary}.
 * Always available so the app remains useful without an AI API key.
 */
@Component
public class FallbackKeywordAnalyzer {

    public AiAnalysisResult analyze(String resumeText, String jobDescriptionText) {
        String resume = safeLower(resumeText);
        String jd = safeLower(jobDescriptionText);

        List<String> jdSkills = new ArrayList<>();
        List<String> matched = new ArrayList<>();
        List<String> missing = new ArrayList<>();

        for (Map.Entry<String, List<String>> entry : TechKeywordDictionary.KEYWORDS.entrySet()) {
            String canonical = entry.getKey();
            boolean inJd = containsAny(jd, entry.getValue());
            boolean inResume = containsAny(resume, entry.getValue());
            if (inJd) {
                jdSkills.add(canonical);
                if (inResume) {
                    matched.add(canonical);
                } else {
                    missing.add(canonical);
                }
            }
        }

        int score = computeScore(jdSkills.size(), matched.size());

        List<String> strengths = new ArrayList<>();
        if (!matched.isEmpty()) {
            strengths.add("Resume already covers " + matched.size() + " of the "
                    + jdSkills.size() + " key skills found in the job description.");
            strengths.add("Strong overlap on: " + joinTop(matched, 6) + ".");
        } else {
            strengths.add("No direct technical keyword overlap detected yet — consider tailoring your resume.");
        }

        List<String> gaps = new ArrayList<>();
        if (!missing.isEmpty()) {
            gaps.add("Missing keywords that appear in the job description: " + joinTop(missing, 8) + ".");
            gaps.add("Add concrete examples or projects demonstrating these skills to improve your ATS score.");
        } else if (!jdSkills.isEmpty()) {
            gaps.add("No major missing keywords — focus on quantifying impact in your bullet points.");
        } else {
            gaps.add("No recognised technical keywords found in the job description.");
        }

        String summary = buildSummary(matched, missing);
        List<String> bullets = buildBullets(matched);
        List<String> interviewQuestions = buildInterviewQuestions(jdSkills);

        return AiAnalysisResult.builder()
                .matchScore(score)
                .matchedKeywords(matched)
                .missingKeywords(missing)
                .importantSkills(jdSkills.isEmpty() ? new ArrayList<>() : new ArrayList<>(jdSkills.subList(0, Math.min(10, jdSkills.size()))))
                .strengths(strengths)
                .gaps(gaps)
                .suggestedSummary(summary)
                .optimizedBullets(bullets)
                .coverLetter(null)
                .recruiterMessage(null)
                .followUpEmail(null)
                .interviewQuestions(interviewQuestions)
                .aiGenerated(false)
                .rawAiResponse(null)
                .build();
    }

    /**
     * Score = 100% when every JD skill is present. When the JD has no recognised
     * keywords we fall back to a neutral 50.
     */
    int computeScore(int jdSkillCount, int matchedCount) {
        if (jdSkillCount == 0) {
            return 50;
        }
        return (int) Math.round((matchedCount * 100.0) / jdSkillCount);
    }

    private String buildSummary(List<String> matched, List<String> missing) {
        StringBuilder sb = new StringBuilder();
        sb.append("Results-driven software engineer");
        if (!matched.isEmpty()) {
            sb.append(" with hands-on experience in ").append(joinTop(matched, 5));
        }
        sb.append(". Proven ability to deliver production-grade applications and collaborate in Agile teams.");
        if (!missing.isEmpty()) {
            sb.append(" Currently expanding expertise toward ").append(joinTop(missing, 3)).append(".");
        }
        return sb.toString();
    }

    private List<String> buildBullets(List<String> matched) {
        List<String> bullets = new ArrayList<>();
        if (matched.isEmpty()) {
            bullets.add("Delivered software features end-to-end, from design through testing and deployment.");
            bullets.add("Collaborated with cross-functional teams in an Agile environment to ship on schedule.");
            return bullets;
        }
        String top = joinTop(matched, 3);
        bullets.add("Designed and built features using " + top + ", improving reliability and maintainability.");
        bullets.add("Implemented automated tests and CI/CD pipelines to reduce regressions and speed up releases.");
        bullets.add("Optimised application performance leveraging " + joinTop(matched, 2) + ", cutting response times.");
        bullets.add("Partnered with product and QA in Agile/Scrum ceremonies to deliver value every sprint.");
        return bullets;
    }

    private List<String> buildInterviewQuestions(List<String> jdSkills) {
        List<String> q = new ArrayList<>();
        q.add("Walk me through a project where you used your strongest technical skill end-to-end.");
        for (String skill : jdSkills.subList(0, Math.min(4, jdSkills.size()))) {
            q.add("Can you describe your hands-on experience with " + skill + " and a problem you solved with it?");
        }
        q.add("How do you ensure code quality and reliability in production systems?");
        q.add("Tell me about a time you had to learn a new technology quickly to deliver a feature.");
        return q;
    }

    // ---- helpers ----

    private static String safeLower(String s) {
        return s == null ? "" : s.toLowerCase(Locale.ROOT);
    }

    private static boolean containsAny(String haystack, List<String> needles) {
        for (String n : needles) {
            if (haystack.contains(n)) {
                return true;
            }
        }
        return false;
    }

    private static String joinTop(List<String> items, int max) {
        Set<String> unique = new LinkedHashSet<>(items);
        List<String> list = new ArrayList<>(unique);
        if (list.size() > max) {
            list = list.subList(0, max);
        }
        return String.join(", ", list);
    }
}
