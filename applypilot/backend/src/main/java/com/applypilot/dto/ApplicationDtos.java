package com.applypilot.dto;

import com.applypilot.domain.ApplicationStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.time.LocalDate;

public final class ApplicationDtos {

    private ApplicationDtos() {
    }

    public record ApplicationRequest(
            @NotBlank String companyName,
            @NotBlank String jobTitle,
            String jobUrl,
            String location,
            String salaryRange,
            LocalDate applicationDate,
            LocalDate followUpDate,
            ApplicationStatus status,
            String notes,
            Long resumeId,
            Long jobDescriptionId,
            Long matchReportId
    ) {
    }

    public record StatusUpdateRequest(
            @NotNull ApplicationStatus status
    ) {
    }

    public record ApplicationResponse(
            Long id,
            String companyName,
            String jobTitle,
            String jobUrl,
            String location,
            String salaryRange,
            LocalDate applicationDate,
            LocalDate followUpDate,
            ApplicationStatus status,
            String notes,
            Long resumeId,
            String resumeTitle,
            Long jobDescriptionId,
            Long matchReportId,
            Integer matchScore,
            Instant createdAt,
            Instant updatedAt
    ) {
    }
}
