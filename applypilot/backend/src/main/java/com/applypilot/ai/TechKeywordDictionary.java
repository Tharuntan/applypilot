package com.applypilot.ai;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Predefined dictionary of common technical keywords used by the fallback
 * analyzer. The key is the canonical display form; the values are lowercase
 * aliases that may appear in resume / job description text.
 */
public final class TechKeywordDictionary {

    private TechKeywordDictionary() {
    }

    public static final Map<String, List<String>> KEYWORDS = buildDictionary();

    private static Map<String, List<String>> buildDictionary() {
        Map<String, List<String>> m = new LinkedHashMap<>();
        m.put("Java", List.of("java"));
        m.put("Spring Boot", List.of("spring boot", "springboot"));
        m.put("Spring MVC", List.of("spring mvc"));
        m.put("Spring Security", List.of("spring security"));
        m.put("REST API", List.of("rest api", "rest apis", "restful", "rest"));
        m.put("Microservices", List.of("microservices", "microservice"));
        m.put("Angular", List.of("angular"));
        m.put("React", List.of("react", "react.js", "reactjs"));
        m.put("TypeScript", List.of("typescript"));
        m.put("JavaScript", List.of("javascript", "js"));
        m.put("HTML", List.of("html", "html5"));
        m.put("CSS", List.of("css", "css3"));
        m.put("Bootstrap", List.of("bootstrap"));
        m.put("SQL", List.of("sql"));
        m.put("PostgreSQL", List.of("postgresql", "postgres"));
        m.put("MySQL", List.of("mysql"));
        m.put("Oracle", List.of("oracle"));
        m.put("SQL Server", List.of("sql server", "mssql"));
        m.put("MongoDB", List.of("mongodb", "mongo"));
        m.put("AWS", List.of("aws", "amazon web services"));
        m.put("Azure", List.of("azure"));
        m.put("Docker", List.of("docker"));
        m.put("Kubernetes", List.of("kubernetes", "k8s"));
        m.put("Jenkins", List.of("jenkins"));
        m.put("Git", List.of("git"));
        m.put("GitHub", List.of("github"));
        m.put("Kafka", List.of("kafka"));
        m.put("RabbitMQ", List.of("rabbitmq"));
        m.put("IBM MQ", List.of("ibm mq", "ibmmq"));
        m.put("JUnit", List.of("junit"));
        m.put("Mockito", List.of("mockito"));
        m.put("Agile", List.of("agile"));
        m.put("Scrum", List.of("scrum"));
        m.put("CI/CD", List.of("ci/cd", "cicd", "ci cd"));
        m.put("Hibernate", List.of("hibernate"));
        m.put("JPA", List.of("jpa"));
        m.put("Maven", List.of("maven"));
        m.put("Gradle", List.of("gradle"));
        m.put("OAuth2", List.of("oauth2", "oauth 2", "oauth"));
        m.put("JWT", List.of("jwt", "json web token"));
        return m;
    }
}
