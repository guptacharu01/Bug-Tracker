package com.bugtracker.controller;

import com.bugtracker.dto.ProjectDto;
import com.bugtracker.dto.ProjectRequest;
import com.bugtracker.entity.User;
import com.bugtracker.service.AuthService;
import com.bugtracker.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {
    private final ProjectService projectService;
    private final AuthService authService;

    public ProjectController(ProjectService projectService, AuthService authService) {
        this.projectService = projectService;
        this.authService = authService;
    }

    @GetMapping
    public ResponseEntity<List<ProjectDto>> findAll() {
        return ResponseEntity.ok(projectService.findAll(authService.currentUser()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectDto> findById(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.findById(id, authService.currentUser()));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @PostMapping
    public ResponseEntity<ProjectDto> create(@Valid @RequestBody ProjectRequest req) {
        return ResponseEntity.ok(projectService.create(req, authService.currentUser()));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @PutMapping("/{id}")
    public ResponseEntity<ProjectDto> update(@PathVariable Long id, @Valid @RequestBody ProjectRequest req) {
        return ResponseEntity.ok(projectService.update(id, req, authService.currentUser()));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        projectService.delete(id, authService.currentUser());
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @PostMapping("/{id}/members/{userId}")
    public ResponseEntity<ProjectDto> addMember(@PathVariable Long id, @PathVariable Long userId) {
        return ResponseEntity.ok(projectService.addMember(id, userId, authService.currentUser()));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @DeleteMapping("/{id}/members/{userId}")
    public ResponseEntity<ProjectDto> removeMember(@PathVariable Long id, @PathVariable Long userId) {
        return ResponseEntity.ok(projectService.removeMember(id, userId, authService.currentUser()));
    }
}
