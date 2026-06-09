package com.applypilot.controller;

import com.applypilot.dto.DocumentDtos.*;
import com.applypilot.service.DocumentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentService service;

    public DocumentController(DocumentService service) {
        this.service = service;
    }

    @PostMapping("/generate")
    @ResponseStatus(HttpStatus.CREATED)
    public DocumentResponse generate(@Valid @RequestBody GenerateDocumentRequest request) {
        return service.generate(request);
    }

    @GetMapping
    public List<DocumentResponse> list() {
        return service.list();
    }

    @GetMapping("/{id}")
    public DocumentResponse get(@PathVariable Long id) {
        return service.get(id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
