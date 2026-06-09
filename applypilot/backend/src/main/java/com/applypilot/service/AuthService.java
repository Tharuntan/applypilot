package com.applypilot.service;

import com.applypilot.domain.Role;
import com.applypilot.domain.User;
import com.applypilot.dto.AuthDtos.*;
import com.applypilot.exception.BadRequestException;
import com.applypilot.repository.UserRepository;
import com.applypilot.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
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
                .build();
        user = userRepository.save(user);
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

    public UserResponse toUserResponse(User user) {
        return new UserResponse(user.getId(), user.getFullName(), user.getEmail(),
                user.getRole().name(), user.getCreatedAt());
    }

    private AuthResponse buildAuthResponse(User user) {
        String token = jwtService.generateToken(user.getEmail(), user.getId());
        return new AuthResponse(token, "Bearer", jwtService.getExpirationMs(), toUserResponse(user));
    }
}
