package com.applypilot.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * Logs a loud warning if the app is running with the built-in development JWT
 * secret. In production you MUST set a strong {@code JWT_SECRET} env variable.
 */
@Slf4j
@Component
public class StartupSecurityCheck {

    private static final String DEV_SECRET_FRAGMENT = "fake-dev-secret-change-me";

    private final ApplyPilotProperties props;

    public StartupSecurityCheck(ApplyPilotProperties props) {
        this.props = props;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void check() {
        String secret = props.getSecurity().getJwtSecret();
        // The default dev secret is the Base64 of a string containing this fragment.
        String decoded = decodeQuietly(secret);
        if (decoded.contains(DEV_SECRET_FRAGMENT)) {
            log.warn("================================================================");
            log.warn("  SECURITY: using the built-in DEVELOPMENT JWT secret.");
            log.warn("  Set a strong JWT_SECRET env var before going to production.");
            log.warn("  Generate one with:  openssl rand -base64 48");
            log.warn("================================================================");
        }
        if (!props.getAi().isConfigured()) {
            log.info("AI provider not configured (no AI_API_KEY) - using keyword fallback. "
                    + "Set AI_API_KEY (Groq is free) to enable AI.");
        }
    }

    private String decodeQuietly(String value) {
        try {
            return new String(java.util.Base64.getDecoder().decode(value));
        } catch (Exception e) {
            return value == null ? "" : value;
        }
    }
}
