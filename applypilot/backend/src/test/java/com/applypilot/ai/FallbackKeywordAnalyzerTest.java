package com.applypilot.ai;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class FallbackKeywordAnalyzerTest {

    private final FallbackKeywordAnalyzer analyzer = new FallbackKeywordAnalyzer();

    @Test
    void detectsMatchedAndMissingKeywords() {
        String resume = "Experienced Java developer skilled in Spring Boot, REST APIs and PostgreSQL.";
        String jd = "Looking for a Java engineer with Spring Boot, Kubernetes and AWS experience.";

        AiAnalysisResult result = analyzer.analyze(resume, jd);

        assertThat(result.getMatchedKeywords()).contains("Java", "Spring Boot");
        assertThat(result.getMissingKeywords()).contains("Kubernetes", "AWS");
        assertThat(result.isAiGenerated()).isFalse();
        assertThat(result.getSuggestedSummary()).isNotBlank();
        assertThat(result.getInterviewQuestions()).isNotEmpty();
    }

    @Test
    void scoreIsHundredWhenAllSkillsPresent() {
        String jd = "Java and Docker required.";
        String resume = "I use Java and Docker daily.";

        AiAnalysisResult result = analyzer.analyze(resume, jd);

        assertThat(result.getMatchScore()).isEqualTo(100);
        assertThat(result.getMissingKeywords()).isEmpty();
    }

    @Test
    void scoreIsHalfWhenOneOfTwoSkillsPresent() {
        String jd = "Java and Kubernetes required.";
        String resume = "I use Java daily.";

        AiAnalysisResult result = analyzer.analyze(resume, jd);

        assertThat(result.getMatchScore()).isEqualTo(50);
    }

    @Test
    void computeScoreReturnsNeutralWhenNoKeywordsInJd() {
        assertThat(analyzer.computeScore(0, 0)).isEqualTo(50);
    }
}
