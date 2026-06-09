package com.applypilot.service;

import com.applypilot.config.ApplyPilotProperties;
import com.applypilot.domain.AuthToken;
import com.applypilot.domain.Role;
import com.applypilot.domain.TokenType;
import com.applypilot.domain.User;
import com.applypilot.dto.AuthDtos.*;
import com.applypilot.exception.BadRequestException;
import com.applypilot.repository.AuthTokenRepository;
import com.applypilot.repository.UserRepository;
import com.applypilot.security.JwtService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Slf4j
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final AuthTokenRepository authTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final MailService mailService;
    private final ApplyPilotProperties props;

    public AuthService(UserRepository userRepository,
                       AuthTokenRepository authTokenRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       MailService mailService,
                       ApplyPilotProperties props) {
        this.userRepository = userRepository;
        this.authTokenRepository = authTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.mailService = mailService;
        this.props = props;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new BadRequestException("An account with this email already exists.");
        }
        User user = User.builder()
                .fullName(request.fullName().trim())
                .email(email)
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(Role.USER)
                .emailVerified(false)
                .build();
        user = userRepository.save(user);
        sendVerificationEmail(user);
        return buildAuthResponse(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String email = request.email().trim().toLowerCase();
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadRequestException("Invalid email or password");
        }
        return buildAuthResponse(user);
    }

    // ---- Email verification ----

    @Transactional
    public void sendVerificationEmail(User user) {
        if (user.isEmailVerified()) {
            return;
        }
        AuthToken token = createToken(user, TokenType.EMAIL_VERIFICATION, 48);
        String link = props.getApp().getFrontendUrl() + "/verify-email?token=" + token.getToken();
        mailService.send(user.getEmail(), "Verify your ApplyPilot email",
                "Welcome to ApplyPilot, " + user.getFullName() + "!\n\n"
                        + "Confirm your email by opening this link:\n" + link
                        + "\n\nThis link expires in 48 hours.");
    }

    @Transactional
    public void resendVerification(User user) {
        sendVerificationEmail(user);
    }

    @Transactional
    public void verifyEmail(String token) {
        AuthToken authToken = authTokenRepository.findByTokenAndType(token, TokenType.EMAIL_VERIFICATION)
                .filter(AuthToken::isUsable)
                .orElseThrow(() -> new BadRequestException("This verification link is invalid or has expired."));
        User user = authToken.getUser();
        user.setEmailVerified(true);
        authToken.setUsedAt(Instant.now());
        userRepository.save(user);
        authTokenRepository.save(authToken);
    }

    // ---- Password reset ----

    /** Always succeeds (does not reveal whether the email exists). */
    @Transactional
    public void requestPasswordReset(String rawEmail) {
        String email = rawEmail.trim().toLowerCase();
        userRepository.findByEmailIgnoreCase(email).ifPresent(user -> {
            AuthToken token = createToken(user, TokenType.PASSWORD_RESET, 1);
            String link = props.getApp().getFrontendUrl() + "/reset-password?token=" + token.getToken();
            mailService.send(user.getEmail(), "Reset your ApplyPilot password",
                    "Hi " + user.getFullName() + ",\n\n"
                            + "Reset your password using this link:\n" + link
                            + "\n\nThis link expires in 1 hour. If you didn't request this, ignore this email.");
        });
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        AuthToken authToken = authTokenRepository.findByTokenAndType(token, TokenType.PASSWORD_RESET)
                .filter(AuthToken::isUsable)
                .orElseThrow(() -> new BadRequestException("This reset link is invalid or has expired."));
        User user = authToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        authToken.setUsedAt(Instant.now());
        userRepository.save(user);
        authTokenRepository.save(authToken);
    }

    // ---- helpers ----

    public UserResponse toUserResponse(User user) {
        return new UserResponse(user.getId(), user.getFullName(), user.getEmail(),
                user.getRole().name(), user.isEmailVerified(), user.getCreatedAt());
    }

    private AuthToken createToken(User user, TokenType type, int expiryHours) {
        AuthToken token = AuthToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString().replace("-", ""))
                .type(type)
                .expiresAt(Instant.now().plus(expiryHours, ChronoUnit.HOURS))
                .build();
        return authTokenRepository.save(token);
    }

    private AuthResponse buildAuthResponse(User user) {
        String jwt = jwtService.generateToken(user.getEmail(), user.getId());
        return new AuthResponse(jwt, "Bearer", jwtService.getExpirationMs(), toUserResponse(user));
    }
}
