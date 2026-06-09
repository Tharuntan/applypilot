package com.applypilot.controller;

import com.applypilot.dto.JobDescriptionDtos.*;
import com.applypilot.service.JobDescriptionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/job-descriptions")
public class JobDescriptionController {

    private final JobDescriptionService service;

    public JobDescriptionController(JobDescriptionService service) {
        this.service = service;
    }

    @GetMapping
    public List<JobDescriptionResponse> list() {
        return service.list();
    }

    @GetMapping("/{id}")
    public JobDescriptionResponse get(@PathVariable Long id) {
        return service.get(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public JobDescriptionResponse create(@Valid @RequestBody JobDescriptionRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public JobDescriptionResponse update(@PathVariable Long id, @Valid @RequestBody JobDescriptionRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
