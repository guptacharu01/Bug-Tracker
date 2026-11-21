package com.bugtracker.service;

import com.bugtracker.dto.IssueDto;
import com.bugtracker.dto.IssueRequest;
import com.bugtracker.dto.StatusUpdateRequest;
import com.bugtracker.entity.Issue;
import com.bugtracker.entity.IssueType;
import com.bugtracker.entity.Priority;
import com.bugtracker.entity.Project;
import com.bugtracker.entity.Role;
import com.bugtracker.entity.Status;
import com.bugtracker.entity.User;
import com.bugtracker.exception.ResourceNotFoundException;
import com.bugtracker.repository.IssueRepository;
import com.bugtracker.repository.ProjectRepository;
import com.bugtracker.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class IssueService {
    private final IssueRepository issues;
    private final ProjectRepository projects;
    private final UserRepository users;
    private final ProjectService projectService;

    public IssueService(IssueRepository issues, ProjectRepository projects, UserRepository users, ProjectService projectService) {
        this.issues = issues; this.projects = projects; this.users = users; this.projectService = projectService;
    }

    public List<IssueDto> search(Long projectId, Status status, Priority priority, Long assigneeId, IssueType type, String search, User current) {
        List<Issue> found = issues.search(projectId, status, priority, assigneeId, type, search);
        if (current.getRole() == Role.DEVELOPER) {
            // Developers only see issues in projects they belong to.
            found = found.stream()
                    .filter(i -> projectService.isMember(i.getProject(), current))
                    .collect(Collectors.toList());
        }
        return found.stream().map(IssueDto::new).collect(Collectors.toList());
    }

    public IssueDto findById(Long id, User current) {
        Issue issue = getIssue(id);
        projectService.checkCanView(issue.getProject(), current);
        return new IssueDto(issue);
    }

    @Transactional
    public IssueDto create(IssueRequest req, User current) {
        if (current.getRole() == Role.DEVELOPER) {
            throw new AccessDeniedException("Developers cannot create issues.");
        }
        Project project = projects.findById(req.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        projectService.checkCanManage(project, current);
        Issue issue = new Issue();
        issue.setTitle(req.getTitle());
        issue.setDescription(req.getDescription());
        issue.setType(req.getType() != null ? req.getType() : IssueType.TASK);
        issue.setPriority(req.getPriority() != null ? req.getPriority() : Priority.MEDIUM);
        issue.setStatus(req.getStatus() != null ? req.getStatus() : Status.TODO);
        issue.setDueDate(req.getDueDate());
        issue.setReporter(current);
        issue.setProject(project);
        if (req.getAssigneeId() != null) {
            issue.setAssignee(users.findById(req.getAssigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assignee not found")));
        }
        return new IssueDto(issues.save(issue));
    }

    @Transactional
    public IssueDto update(Long id, IssueRequest req, User current) {
        Issue issue = getIssue(id);
        checkCanEdit(issue, current);
        if (req.getTitle() != null) issue.setTitle(req.getTitle());
        if (req.getDescription() != null) issue.setDescription(req.getDescription());
        if (req.getType() != null) issue.setType(req.getType());
        if (req.getPriority() != null) issue.setPriority(req.getPriority());
        if (req.getStatus() != null) issue.setStatus(req.getStatus());
        if (req.getDueDate() != null) issue.setDueDate(req.getDueDate());
        if (req.getAssigneeId() != null) {
            issue.setAssignee(users.findById(req.getAssigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assignee not found")));
        }
        return new IssueDto(issues.save(issue));
    }

    @Transactional
    public IssueDto updateStatus(Long id, StatusUpdateRequest req, User current) {
        Issue issue = getIssue(id);
        checkCanEdit(issue, current);
        issue.setStatus(req.getStatus());
        return new IssueDto(issues.save(issue));
    }

    @Transactional
    public void delete(Long id, User current) {
        Issue issue = getIssue(id);
        if (current.getRole() != Role.ADMIN
                && !(current.getRole() == Role.MANAGER && issue.getProject().getOwner().getId().equals(current.getId()))) {
            throw new AccessDeniedException("Only a manager or admin can delete an issue.");
        }
        issues.delete(issue);
    }

    @Transactional
    public IssueDto uploadScreenshot(Long id, MultipartFile file, User current) throws IOException {
        Issue issue = getIssue(id);
        checkCanEdit(issue, current);
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Please choose a screenshot file.");
        }
        String name = UUID.randomUUID() + "_" + Paths.get(file.getOriginalFilename()).getFileName().toString();
        Path dir = Paths.get("uploads");
        Files.createDirectories(dir);
        Files.copy(file.getInputStream(), dir.resolve(name));
        issue.setScreenshot(name);
        return new IssueDto(issues.save(issue));
    }

    public Issue getIssue(Long id) {
        return issues.findById(id).orElseThrow(() -> new ResourceNotFoundException("Issue not found"));
    }

    private void checkCanEdit(Issue issue, User current) {
        if (current.getRole() == Role.ADMIN) return;
        if (current.getRole() == Role.MANAGER && issue.getProject().getOwner().getId().equals(current.getId())) return;
        if (issue.getAssignee() != null && issue.getAssignee().getId().equals(current.getId())) return;
        if (issue.getReporter().getId().equals(current.getId())) return;
        throw new AccessDeniedException("You do not have permission to change this issue.");
    }

    public long countByStatus(Status status) {
        return issues.countByStatus(status);
    }

    public long countAll() {
        return issues.count();
    }
}
