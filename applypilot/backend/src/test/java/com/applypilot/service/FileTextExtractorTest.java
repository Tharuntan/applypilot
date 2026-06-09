package com.applypilot.service;

import com.applypilot.exception.BadRequestException;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class FileTextExtractorTest {

    private final FileTextExtractor extractor = new FileTextExtractor();

    @Test
    void extractsTextFromPlainTextFile() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "john_doe_resume.txt", "text/plain",
                "John Doe\nJava developer with Spring Boot and Angular experience.".getBytes());

        String text = extractor.extract(file);

        assertThat(text).contains("Java developer").contains("Spring Boot");
    }

    @Test
    void rejectsEmptyFile() {
        MockMultipartFile file = new MockMultipartFile("file", "empty.txt", "text/plain", new byte[0]);
        assertThatThrownBy(() -> extractor.extract(file)).isInstanceOf(BadRequestException.class);
    }

    @Test
    void suggestsTitleFromFilename() {
        assertThat(extractor.suggestTitle("Java_Full_Stack_Resume.pdf")).isEqualTo("Java Full Stack Resume");
        assertThat(extractor.suggestTitle(null)).isEqualTo("Uploaded Resume");
    }
}
