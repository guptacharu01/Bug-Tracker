package com.bugtracker.controller;

import com.bugtracker.dto.RoleUpdateRequest;
import com.bugtracker.dto.UserDto;
import com.bugtracker.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<UserDto>> findAll() {
        return ResponseEntity.ok(userService.findAll());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/role")
    public ResponseEntity<UserDto> updateRole(@PathVariable Long id, @Valid @RequestBody RoleUpdateRequest req) {
        return ResponseEntity.ok(userService.updateRole(id, req));
    }
}
