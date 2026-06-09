package com.applypilot;

import com.applypilot.domain.AuthToken;
import com.applypilot.domain.TokenType;
import com.applypilot.repository.AuthTokenRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Covers email verification + password reset (Phase 4). AI/SMTP are disabled in
 * the test profile, so emails are logged and tokens are read from the repository.
 */
@SpringBootTest
@AutoConfigureMockMvc
class AuthEmailFlowTest {

    @Autowired
    MockMvc mvc;

    @Autowired
    ObjectMapper mapper;

    @Autowired
    AuthTokenRepository authTokenRepository;

    private void register(String email) throws Exception {
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fullName\":\"Test\",\"email\":\"" + email + "\",\"password\":\"password123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.emailVerified").value(false));
    }

    private String latestToken(TokenType type) {
        return authTokenRepository.findAll().stream()
                .filter(t -> t.getType() == type)
                .reduce((a, b) -> b.getId() > a.getId() ? b : a)
                .map(AuthToken::getToken)
                .orElseThrow();
    }

    @Test
    void emailVerificationFlow() throws Exception {
        register("verify-flow@example.com");
        String token = latestToken(TokenType.EMAIL_VERIFICATION);

        mvc.perform(post("/api/auth/verify-email").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"token\":\"" + token + "\"}"))
                .andExpect(status().isOk());

        // A second use of the same token must fail (single-use)
        mvc.perform(post("/api/auth/verify-email").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"token\":\"" + token + "\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void passwordResetFlow() throws Exception {
        register("reset-flow@example.com");

        mvc.perform(post("/api/auth/forgot-password").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"reset-flow@example.com\"}"))
                .andExpect(status().isOk());

        String token = latestToken(TokenType.PASSWORD_RESET);
        mvc.perform(post("/api/auth/reset-password").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"token\":\"" + token + "\",\"password\":\"newpassword456\"}"))
                .andExpect(status().isOk());

        // Old password fails, new password works
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"reset-flow@example.com\",\"password\":\"password123\"}"))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"reset-flow@example.com\",\"password\":\"newpassword456\"}"))
                .andExpect(status().isOk());
    }

    @Test
    void forgotPasswordForUnknownEmailStillReturnsOk() throws Exception {
        mvc.perform(post("/api/auth/forgot-password").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"nobody@example.com\"}"))
                .andExpect(status().isOk());
        assertThat(authTokenRepository.findAll()).noneMatch(t -> t.getType() == TokenType.PASSWORD_RESET);
    }
}
