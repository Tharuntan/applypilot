package com.applypilot.controller;

import com.applypilot.ai.AiService;
import com.applypilot.config.ApplyPilotProperties;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Exposes whether real AI is configured, so the UI can show an ON/OFF badge
 * and explain when it's using the keyword fallback.
 */
@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiService aiService;
    private final ApplyPilotProperties props;

    public AiController(AiService aiService, ApplyPilotProperties props) {
        this.aiService = aiService;
        this.props = props;
    }

    public record AiStatus(boolean enabled, String model, String provider) {
    }

    @GetMapping("/status")
    public AiStatus status() {
        boolean enabled = aiService.isAiEnabled();
        return new AiStatus(enabled, enabled ? props.getAi().getModel() : null, providerName());
    }

    private String providerName() {
        String url = props.getAi().getBaseUrl() == null ? "" : props.getAi().getBaseUrl().toLowerCase();
        if (url.contains("groq")) return "Groq";
        if (url.contains("openai")) return "OpenAI";
        if (url.contains("anthropic")) return "Anthropic";
        if (url.isBlank()) return "Unknown";
        return "Custom";
    }
}
