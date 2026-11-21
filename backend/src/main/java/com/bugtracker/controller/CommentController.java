package com.bugtracker.controller;

import com.bugtracker.dto.CommentDto;
import com.bugtracker.dto.CommentRequest;
import com.bugtracker.service.AuthService;
import com.bugtracker.service.CommentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/issues/{id}/comments")
public class CommentController {
    private final CommentService commentService;
    private final AuthService authService;

    public CommentController(CommentService commentService, AuthService authService) {
        this.commentService = commentService;
        this.authService = authService;
    }

    @GetMapping
    public ResponseEntity<List<CommentDto>> findByIssue(@PathVariable Long id) {
        return ResponseEntity.ok(commentService.findByIssue(id, authService.currentUser()));
    }

    @PostMapping
    public ResponseEntity<CommentDto> add(@PathVariable Long id, @Valid @RequestBody CommentRequest req) {
        return ResponseEntity.ok(commentService.add(id, req, authService.currentUser()));
    }
}
