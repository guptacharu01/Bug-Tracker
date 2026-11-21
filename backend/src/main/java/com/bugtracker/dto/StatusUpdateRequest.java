package com.bugtracker.dto;

import com.bugtracker.entity.Status;
import jakarta.validation.constraints.NotNull;

public class StatusUpdateRequest {
    @NotNull private Status status;

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
}
