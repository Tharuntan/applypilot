package com.applypilot.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/**
 * A single-use, time-limited token for password reset or email verification.
 */
@Entity
@Table(name = "auth_tokens", indexes = @Index(name = "idx_auth_token", columnList = "token"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthToken extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, unique = true, length = 100)
    private String token;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TokenType type;

    @Column(nullable = false)
    private Instant expiresAt;

    private Instant usedAt;

    public boolean isUsable() {
        return usedAt == null && expiresAt != null && expiresAt.isAfter(Instant.now());
    }
}
