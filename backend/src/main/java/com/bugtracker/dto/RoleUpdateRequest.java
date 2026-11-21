package com.bugtracker.dto;

import com.bugtracker.entity.Role;
import jakarta.validation.constraints.NotNull;

public class RoleUpdateRequest {
    @NotNull private Role role;

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
}
