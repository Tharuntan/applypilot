package com.applypilot.controller;

import com.applypilot.domain.ApplicationStatus;
import com.applypilot.dto.ApplicationDtos.*;
import com.applypilot.service.ApplicationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    private final ApplicationService service;

    public ApplicationController(ApplicationService service) {
        this.service = service;
    }

    @GetMapping
    public List<ApplicationResponse> list(@RequestParam(required = false) ApplicationStatus status) {
        return service.list(status);
    }

    @GetMapping("/{id}")
    public ApplicationResponse get(@PathVariable Long id) {
        return service.get(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApplicationResponse create(@Valid @RequestBody ApplicationRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public ApplicationResponse update(@PathVariable Long id, @Valid @RequestBody ApplicationRequest request) {
        return service.update(id, request);
    }

    @PutMapping("/{id}/status")
    public ApplicationResponse updateStatus(@PathVariable Long id, @Valid @RequestBody StatusUpdateRequest request) {
        return service.updateStatus(id, request.status());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
