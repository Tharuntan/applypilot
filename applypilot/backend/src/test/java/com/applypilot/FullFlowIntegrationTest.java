package com.applypilot;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Exercises the full MVP user flow end-to-end against an in-memory database with
 * AI disabled (fallback keyword analysis).
 */
@SpringBootTest
@AutoConfigureMockMvc
class FullFlowIntegrationTest {

    @Autowired
    MockMvc mvc;

    @Autowired
    ObjectMapper mapper;

    private String register(String email) throws Exception {
        String body = """
                {"fullName":"Test User","email":"%s","password":"password123"}
                """.formatted(email);
        MvcResult res = mvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andReturn();
        return mapper.readTree(res.getResponse().getContentAsString()).get("token").asText();
    }

    private long postId(String url, String token, String body) throws Exception {
        MvcResult res = mvc.perform(post(url)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().is2xxSuccessful())
                .andReturn();
        return mapper.readTree(res.getResponse().getContentAsString()).get("id").asLong();
    }

    @Test
    void registerLoginAndAccessProfile() throws Exception {
        String token = register("auth-flow@example.com");
        mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("auth-flow@example.com"));

        // login returns a token too
        String login = """
                {"email":"auth-flow@example.com","password":"password123"}
                """;
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(login))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists());
    }

    @Test
    void protectedEndpointRejectsWithoutToken() throws Exception {
        mvc.perform(get("/api/resumes")).andExpect(status().isUnauthorized());
    }

    @Test
    void duplicateRegistrationIsRejected() throws Exception {
        register("dupe@example.com");
        String body = """
                {"fullName":"Dupe","email":"dupe@example.com","password":"password123"}
                """;
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    void fullJobApplicationFlow() throws Exception {
        String token = register("full-flow@example.com");

        long resumeId = postId("/api/resumes", token, """
                {"title":"Java Full Stack Resume",
                 "content":"Java developer with Spring Boot, REST APIs, Angular, PostgreSQL and Docker experience.",
                 "primaryResume":true}
                """);

        long jdId = postId("/api/job-descriptions", token, """
                {"companyName":"Acme Corp","jobTitle":"Senior Java Engineer",
                 "descriptionText":"We need Java, Spring Boot, Kubernetes, AWS and Kafka skills."}
                """);

        // Analyze match (fallback keyword analysis, AI disabled in test profile)
        MvcResult matchRes = mvc.perform(post("/api/match/analyze")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"resumeId\":" + resumeId + ",\"jobDescriptionId\":" + jdId + "}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.matchScore").isNumber())
                .andExpect(jsonPath("$.matchedKeywords").isArray())
                .andExpect(jsonPath("$.coverLetter").isNotEmpty())
                .andReturn();
        JsonNode match = mapper.readTree(matchRes.getResponse().getContentAsString());
        long matchReportId = match.get("id").asLong();
        assertThat(match.get("matchedKeywords").toString()).contains("Java");
        assertThat(match.get("missingKeywords").toString()).contains("Kubernetes");
        assertThat(match.get("aiGenerated").asBoolean()).isFalse();

        // Save as application linked to the match report
        long appId = postId("/api/applications", token, """
                {"companyName":"Acme Corp","jobTitle":"Senior Java Engineer",
                 "status":"APPLIED","resumeId":%d,"jobDescriptionId":%d,"matchReportId":%d}
                """.formatted(resumeId, jdId, matchReportId));

        // Update status
        mvc.perform(put("/api/applications/" + appId + "/status")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"INTERVIEW\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("INTERVIEW"));

        // Generate a cover letter document
        mvc.perform(post("/api/documents/generate")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"documentType\":\"COVER_LETTER\",\"jobApplicationId\":" + appId + "}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.content").isNotEmpty());

        // Dashboard summary reflects the activity
        mvc.perform(get("/api/dashboard/summary").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalApplications").value(1))
                .andExpect(jsonPath("$.interviews").value(1))
                .andExpect(jsonPath("$.highestMatchScore").isNumber())
                .andExpect(jsonPath("$.topMissingSkills").isArray());
    }

    @Test
    void usersCannotSeeEachOthersData() throws Exception {
        String tokenA = register("user-a@example.com");
        String tokenB = register("user-b@example.com");

        long resumeId = postId("/api/resumes", tokenA, """
                {"title":"A Resume","content":"Java","primaryResume":true}
                """);

        // User B must not be able to read user A's resume
        mvc.perform(get("/api/resumes/" + resumeId).header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isNotFound());
    }
}
