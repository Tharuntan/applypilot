package com.applypilot.repository;

import com.applypilot.domain.AuthToken;
import com.applypilot.domain.TokenType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AuthTokenRepository extends JpaRepository<AuthToken, Long> {
    Optional<AuthToken> findByTokenAndType(String token, TokenType type);
}
