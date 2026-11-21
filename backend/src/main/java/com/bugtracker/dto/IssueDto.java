package com.bugtracker.dto;

import com.bugtracker.entity.Issue;
import com.bugtracker.entity.IssueType;
import com.bugtracker.entity.Priority;
import com.bugtracker.entity.Status;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class IssueDto {
    private Long id;
    private String title;
    private String description;
    private IssueType type;
    private Priority priority;
    private Status status;
    private UserDto assignee;
    private UserDto reporter;
    private Long projectId;
    private String projectName;
    private LocalDateTime createdDate;
    private LocalDate dueDate;
    private String screenshot;

    public IssueDto() {}
    public IssueDto(Issue i) {
        this.id = i.getId(); this.title = i.getTitle(); this.description = i.getDescription();
        this.type = i.getType(); this.priority = i.getPriority(); this.status = i.getStatus();
        this.assignee = i.getAssignee() != null ? new UserDto(i.getAssignee()) : null;
        this.reporter = new UserDto(i.getReporter());
        this.projectId = i.getProject().getId(); this.projectName = i.getProject().getName();
        this.createdDate = i.getCreatedDate(); this.dueDate = i.getDueDate(); this.screenshot = i.getScreenshot();
    }
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public IssueType getType() { return type; }
    public void setType(IssueType type) { this.type = type; }
    public Priority getPriority() { return priority; }
    public void setPriority(Priority priority) { this.priority = priority; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public UserDto getAssignee() { return assignee; }
    public void setAssignee(UserDto assignee) { this.assignee = assignee; }
    public UserDto getReporter() { return reporter; }
    public void setReporter(UserDto reporter) { this.reporter = reporter; }
    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }
    public String getProjectName() { return projectName; }
    public void setProjectName(String projectName) { this.projectName = projectName; }
    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public String getScreenshot() { return screenshot; }
    public void setScreenshot(String screenshot) { this.screenshot = screenshot; }
}
