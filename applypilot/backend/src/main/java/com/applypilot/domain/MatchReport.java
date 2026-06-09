package com.applypilot.domain;

import jakarta.persistence.*;
import lombok.*;

/**
 * Stores the outcome of analysing a resume against a job description.
 * List-style fields are persisted as JSON strings in {@code text} columns
 * and converted to/from {@code List<String>} in the service layer.
 */
@Entity
@Table(name = "match_reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchReport extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "resume_id", nullable = false)
    private Resume resume;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "job_description_id", nullable = false)
    private JobDescription jobDescription;

    @Column(nullable = false)
    private int matchScore;

    @Column(columnDefinition = "text")
    private String matchedKeywords;

    @Column(columnDefinition = "text")
    private String missingKeywords;

    @Column(columnDefinition = "text")
    private String importantSkills;

    @Column(columnDefinition = "text")
    private String strengths;

    @Column(columnDefinition = "text")
    private String gaps;

    @Column(columnDefinition = "text")
    private String suggestedSummary;

    @Column(columnDefinition = "text")
    private String optimizedBullets;

    @Column(columnDefinition = "text")
    private String coverLetter;

    @Column(columnDefinition = "text")
    private String recruiterMessage;

    @Column(columnDefinition = "text")
    private String followUpEmail;

    @Column(columnDefinition = "text")
    private String interviewQuestions;

    @Column(columnDefinition = "text")
    private String rawAiResponse;

    /** True when produced by the AI provider, false when fallback keyword analysis was used. */
    @Column(nullable = false)
    @Builder.Default
    private boolean aiGenerated = false;
}
