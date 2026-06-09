package com.applypilot.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public final class JobDescriptionDtos {

    private JobDescriptionDtos() {
    }

    public record JobDescriptionRequest(
            @NotBlank @Size(max = 160) String companyName,
            @NotBlank @Size(max = 160) String jobTitle,
            @Size(max = 500) String jobUrl,
            @Size(max = 160) String location,
            @Size(max = 80) String employmentType,
            @Size(max = 120) String salaryRange,
            @NotBlank String descriptionText
    ) {
    }

    public record JobDescriptionResponse(
            Long id,
            String companyName,
            String jobTitle,
            String jobUrl,
            String location,
            String employmentType,
            String salaryRange,
            String descriptionText,
            Instant createdAt,
            Instant updatedAt
    ) {
    }
}
