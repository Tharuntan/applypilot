package com.applypilot.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.Instant;

/**
 * Authentication-related request/response payloads.
 */
public final class AuthDtos {

    private AuthDtos() {
    }

    public record RegisterRequest(
            @NotBlank @Size(max = 120) String fullName,
            @NotBlank @Email @Size(max = 180) String email,
            @NotBlank @Size(min = 6, max = 100) String password
    ) {
    }

    public record LoginRequest(
            @NotBlank @Email String email,
            @NotBlank String password
    ) {
    }

    public record AuthResponse(
            String token,
            String tokenType,
            long expiresInMs,
            UserResponse user
    ) {
    }

    public record UserResponse(
            Long id,
            String fullName,
            String email,
            String role,
            Instant createdAt
    ) {
    }
}
