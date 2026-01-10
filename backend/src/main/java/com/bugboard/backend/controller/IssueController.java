package com.bugboard.backend.controller;

import com.bugboard.backend.dto.issue.IssueRequest;
import com.bugboard.backend.dto.issue.IssueResponse;
import com.bugboard.backend.model.IssueState;
import com.bugboard.backend.service.IssueService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/issues")
@RequiredArgsConstructor
public class IssueController {

    private final IssueService issueService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<IssueResponse> create(
            @RequestPart("request") @Valid IssueRequest request,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) {
        return ResponseEntity.ok(issueService.createIssue(request, file));
    }

    @PutMapping("/{id}/state")
    public ResponseEntity<IssueResponse> updateState(
            @PathVariable Long id,
            @RequestParam IssueState state) {
        return ResponseEntity.ok(issueService.updateState(id, state));
    }

    @GetMapping
    public ResponseEntity<List<IssueResponse>> getAll() {
        return ResponseEntity.ok(issueService.getAllIssues());
    }

    @PutMapping("/{id}")
    public ResponseEntity<IssueResponse> updateIssue(
            @PathVariable Long id,
            @RequestBody @Valid IssueRequest request
    ) {
        return ResponseEntity.ok(issueService.updateIssueDetails(id, request));
    }
}