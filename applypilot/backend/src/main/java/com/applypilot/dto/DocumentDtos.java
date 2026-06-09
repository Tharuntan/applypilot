package com.applypilot.dto;

import com.applypilot.domain.DocumentType;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public final class DocumentDtos {

    private DocumentDtos() {
    }

    /**
     * Request to generate a document. Either provide raw resume/job text, or
     * reference saved resume / job description ids and the service will load them.
     */
    public record GenerateDocumentRequest(
            @NotNull DocumentType documentType,
            String title,
            Long resumeId,
            Long jobDescriptionId,
            Long jobApplicationId,
            String resumeText,
            String jobDescriptionText,
            String companyName,
            String jobTitle
    ) {
    }

    public record DocumentResponse(
            Long id,
            DocumentType documentType,
            String title,
            String content,
            Long jobApplicationId,
            boolean aiGenerated,
            Instant createdAt,
            Instant updatedAt
    ) {
    }
}
