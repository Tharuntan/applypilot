package com.applypilot.controller;

import com.applypilot.dto.ResumeDtos.*;
import com.applypilot.service.FileTextExtractor;
import com.applypilot.service.ResumeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/resumes")
public class ResumeController {

    private final ResumeService service;
    private final FileTextExtractor fileTextExtractor;

    public ResumeController(ResumeService service, FileTextExtractor fileTextExtractor) {
        this.service = service;
        this.fileTextExtractor = fileTextExtractor;
    }

    /**
     * Upload a PDF/DOCX/TXT resume; returns the extracted text and a suggested
     * title so the user can review and edit before saving.
     */
    @PostMapping(value = "/extract", consumes = "multipart/form-data")
    public ResumeExtractResponse extract(@RequestParam("file") MultipartFile file) {
        String text = fileTextExtractor.extract(file);
        String title = fileTextExtractor.suggestTitle(file.getOriginalFilename());
        return new ResumeExtractResponse(title, text);
    }

    @GetMapping
    public List<ResumeResponse> list() {
        return service.list();
    }

    @GetMapping("/{id}")
    public ResumeResponse get(@PathVariable Long id) {
        return service.get(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResumeResponse create(@Valid @RequestBody ResumeRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public ResumeResponse update(@PathVariable Long id, @Valid @RequestBody ResumeRequest request) {
        return service.update(id, request);
    }

    @PutMapping("/{id}/primary")
    public ResumeResponse makePrimary(@PathVariable Long id) {
        return service.makePrimary(id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
