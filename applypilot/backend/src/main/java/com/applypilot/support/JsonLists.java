package com.applypilot.support;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.List;

/**
 * Helpers to serialise {@code List<String>} to/from JSON for storage in
 * {@code text} columns.
 */
public final class JsonLists {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private JsonLists() {
    }

    public static String toJson(List<String> list) {
        if (list == null || list.isEmpty()) {
            return "[]";
        }
        try {
            return MAPPER.writeValueAsString(list);
        } catch (Exception e) {
            return "[]";
        }
    }

    public static List<String> fromJson(String json) {
        if (json == null || json.isBlank()) {
            return new ArrayList<>();
        }
        try {
            return MAPPER.readValue(json, new TypeReference<List<String>>() {
            });
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }
}
