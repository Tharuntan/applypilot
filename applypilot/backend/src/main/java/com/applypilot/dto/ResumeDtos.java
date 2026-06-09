package com.applypilot.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public final class ResumeDtos {

    private ResumeDtos() {
    }

    public record ResumeRequest(
            @NotBlank @Size(max = 160) String title,
            @NotBlank String content,
            Boolean primaryResume
    ) {
    }

    public record ResumeResponse(
            Long id,
            String title,
            String content,
            boolean primaryResume,
            Instant createdAt,
            Instant updatedAt
    ) {
    }
}
