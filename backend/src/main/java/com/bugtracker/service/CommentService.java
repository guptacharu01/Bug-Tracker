package com.bugtracker.service;

import com.bugtracker.dto.CommentDto;
import com.bugtracker.dto.CommentRequest;
import com.bugtracker.entity.Comment;
import com.bugtracker.entity.Issue;
import com.bugtracker.entity.User;
import com.bugtracker.repository.CommentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommentService {
    private final CommentRepository comments;
    private final IssueService issueService;
    private final ProjectService projectService;

    public CommentService(CommentRepository comments, IssueService issueService, ProjectService projectService) {
        this.comments = comments; this.issueService = issueService; this.projectService = projectService;
    }

    public List<CommentDto> findByIssue(Long issueId, User current) {
        Issue issue = issueService.getIssue(issueId);
        projectService.checkCanView(issue.getProject(), current);
        return comments.findByIssueIdOrderByCreatedAtAsc(issueId).stream()
                .map(CommentDto::new).collect(Collectors.toList());
    }

    @Transactional
    public CommentDto add(Long issueId, CommentRequest req, User current) {
        Issue issue = issueService.getIssue(issueId);
        projectService.checkCanView(issue.getProject(), current);
        Comment c = new Comment();
        c.setText(req.getText());
        c.setAuthor(current);
        c.setIssue(issue);
        return new CommentDto(comments.save(c));
    }
}
