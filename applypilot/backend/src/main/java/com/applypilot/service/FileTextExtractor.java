package com.applypilot.service;

import com.applypilot.exception.BadRequestException;
import org.apache.tika.metadata.Metadata;
import org.apache.tika.metadata.TikaCoreProperties;
import org.apache.tika.parser.AutoDetectParser;
import org.apache.tika.parser.ParseContext;
import org.apache.tika.sax.BodyContentHandler;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;

/**
 * Extracts plain text from an uploaded resume file (PDF, DOCX, DOC, TXT, RTF)
 * using Apache Tika. Used so users can upload a file instead of pasting text.
 */
@Service
public class FileTextExtractor {

    /** -1 disables Tika's default 100k char limit so long resumes parse fully. */
    private static final int NO_WRITE_LIMIT = -1;

    private static final long MAX_BYTES = 5 * 1024 * 1024; // 5 MB

    public String extract(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("No file uploaded.");
        }
        if (file.getSize() > MAX_BYTES) {
            throw new BadRequestException("File too large. Maximum size is 5 MB.");
        }
        try (InputStream in = file.getInputStream()) {
            BodyContentHandler handler = new BodyContentHandler(NO_WRITE_LIMIT);
            Metadata metadata = new Metadata();
            metadata.set(TikaCoreProperties.RESOURCE_NAME_KEY, file.getOriginalFilename());
            new AutoDetectParser().parse(in, handler, metadata, new ParseContext());
            String text = handler.toString().trim();
            if (text.isBlank()) {
                throw new BadRequestException(
                        "Could not read any text from this file. If it's a scanned PDF, paste the text instead.");
            }
            return normalise(text);
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            throw new BadRequestException("Could not read this file. Supported formats: PDF, DOCX, DOC, TXT, RTF.");
        }
    }

    /** Collapse excessive blank lines Tika sometimes emits. */
    private String normalise(String text) {
        return text.replaceAll("[ \\t]+\n", "\n").replaceAll("\n{3,}", "\n\n").trim();
    }

    /** A reasonable default resume title derived from the file name. */
    public String suggestTitle(String originalFilename) {
        if (originalFilename == null || originalFilename.isBlank()) {
            return "Uploaded Resume";
        }
        String base = originalFilename;
        int dot = base.lastIndexOf('.');
        if (dot > 0) {
            base = base.substring(0, dot);
        }
        base = base.replaceAll("[_-]+", " ").trim();
        return base.isBlank() ? "Uploaded Resume" : base;
    }
}
