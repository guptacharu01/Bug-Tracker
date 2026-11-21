package com.bugtracker.controller;

import com.bugtracker.dto.IssueDto;
import com.bugtracker.dto.IssueRequest;
import com.bugtracker.dto.StatusUpdateRequest;
import com.bugtracker.entity.IssueType;
import com.bugtracker.entity.Priority;
import com.bugtracker.entity.Status;
import com.bugtracker.service.AuthService;
import com.bugtracker.service.IssueService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/issues")
public class IssueController {
    private final IssueService issueService;
    private final AuthService authService;

    public IssueController(IssueService issueService, AuthService authService) {
        this.issueService = issueService;
        this.authService = authService;
    }

    @GetMapping
    public ResponseEntity<List<IssueDto>> search(
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) Status status,
            @RequestParam(required = false) Priority priority,
            @RequestParam(required = false) Long assigneeId,
            @RequestParam(required = false) IssueType type,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(issueService.search(projectId, status, priority, assigneeId, type, search, authService.currentUser()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<IssueDto> findById(@PathVariable Long id) {
        return ResponseEntity.ok(issueService.findById(id, authService.currentUser()));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @PostMapping
    public ResponseEntity<IssueDto> create(@Valid @RequestBody IssueRequest req) {
        return ResponseEntity.ok(issueService.create(req, authService.currentUser()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<IssueDto> update(@PathVariable Long id, @Valid @RequestBody IssueRequest req) {
        return ResponseEntity.ok(issueService.update(id, req, authService.currentUser()));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<IssueDto> updateStatus(@PathVariable Long id, @Valid @RequestBody StatusUpdateRequest req) {
        return ResponseEntity.ok(issueService.updateStatus(id, req, authService.currentUser()));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        issueService.delete(id, authService.currentUser());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/screenshot")
    public ResponseEntity<IssueDto> uploadScreenshot(@PathVariable Long id, @RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(issueService.uploadScreenshot(id, file, authService.currentUser()));
    }
}
