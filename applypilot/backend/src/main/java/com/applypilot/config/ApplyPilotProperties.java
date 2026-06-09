package com.applypilot.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.NestedConfigurationProperty;

/**
 * Strongly typed access to all {@code applypilot.*} configuration.
 */
@Getter
@Setter
@ConfigurationProperties(prefix = "applypilot")
public class ApplyPilotProperties {

    @NestedConfigurationProperty
    private Security security = new Security();

    @NestedConfigurationProperty
    private Cors cors = new Cors();

    @NestedConfigurationProperty
    private Ai ai = new Ai();

    @NestedConfigurationProperty
    private App app = new App();

    @Getter
    @Setter
    public static class App {
        /** Public frontend URL, used to build links in emails. */
        private String frontendUrl = "http://localhost:4200";
        /** From address for outgoing emails. */
        private String mailFrom = "no-reply@applypilot.app";
    }

    @Getter
    @Setter
    public static class Security {
        private String jwtSecret;
        private long jwtExpirationMs = 86_400_000L;
    }

    @Getter
    @Setter
    public static class Cors {
        /** Comma-separated list of allowed origins. */
        private String allowedOrigins = "http://localhost:4200";
    }

    @Getter
    @Setter
    public static class Ai {
        private String apiKey = "";
        private String baseUrl = "https://api.openai.com/v1";
        private String model = "gpt-4o-mini";
        private int timeoutSeconds = 60;

        public boolean isConfigured() {
            return apiKey != null && !apiKey.isBlank();
        }
    }
}
