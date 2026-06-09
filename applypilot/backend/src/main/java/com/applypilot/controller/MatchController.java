package com.applypilot.controller;

import com.applypilot.dto.MatchDtos.*;
import com.applypilot.service.MatchService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/match")
public class MatchController {

    private final MatchService service;

    public MatchController(MatchService service) {
        this.service = service;
    }

    @PostMapping("/analyze")
    public MatchReportResponse analyze(@Valid @RequestBody AnalyzeRequest request) {
        return service.analyze(request);
    }

    @GetMapping("/reports")
    public List<MatchReportResponse> reports() {
        return service.list();
    }

    @GetMapping("/reports/{id}")
    public MatchReportResponse report(@PathVariable Long id) {
        return service.get(id);
    }

    @DeleteMapping("/reports/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
