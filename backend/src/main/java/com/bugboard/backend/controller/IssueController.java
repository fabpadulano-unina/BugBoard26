package com.bugboard.backend.controller;

import com.bugboard.backend.dto.issue.IssueRequest;
import com.bugboard.backend.dto.issue.IssueResponse;
import com.bugboard.backend.service.IssueService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/issues")
@RequiredArgsConstructor
public class IssueController {

    private final IssueService issueService;

    @PostMapping
    public ResponseEntity<IssueResponse> create(@RequestBody @Valid IssueRequest request) {
        return ResponseEntity.ok(issueService.createIssue(request));
    }

    @GetMapping
    public ResponseEntity<List<IssueResponse>> getAll() {
        return ResponseEntity.ok(issueService.getAllIssues());
    }
}