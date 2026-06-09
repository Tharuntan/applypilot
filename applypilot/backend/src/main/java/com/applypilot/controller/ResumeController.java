package com.applypilot.controller;

import com.applypilot.dto.ResumeDtos.*;
import com.applypilot.service.ResumeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resumes")
public class ResumeController {

    private final ResumeService service;

    public ResumeController(ResumeService service) {
        this.service = service;
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
