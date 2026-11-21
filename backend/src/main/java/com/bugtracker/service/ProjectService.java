package com.bugtracker.service;

import com.bugtracker.dto.ProjectDto;
import com.bugtracker.dto.ProjectRequest;
import com.bugtracker.entity.Project;
import com.bugtracker.entity.Role;
import com.bugtracker.entity.User;
import com.bugtracker.exception.ResourceNotFoundException;
import com.bugtracker.repository.ProjectRepository;
import com.bugtracker.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectService {
    private final ProjectRepository projects;
    private final UserRepository users;

    public ProjectService(ProjectRepository projects, UserRepository users) {
        this.projects = projects; this.users = users;
    }

    public List<ProjectDto> findAll(User current) {
        if (current.getRole() == Role.ADMIN || current.getRole() == Role.MANAGER) {
            return projects.findAll().stream().map(ProjectDto::new).collect(Collectors.toList());
        }
        return projects.findByMembersId(current.getId()).stream().map(ProjectDto::new).collect(Collectors.toList());
    }

    public ProjectDto findById(Long id, User current) {
        Project p = getProject(id);
        checkCanView(p, current);
        return new ProjectDto(p);
    }

    @Transactional
    public ProjectDto create(ProjectRequest req, User current) {
        if (current.getRole() == Role.DEVELOPER) {
            throw new AccessDeniedException("Developers cannot create projects.");
        }
        Project p = new Project();
        p.setName(req.getName());
        p.setDescription(req.getDescription());
        p.setOwner(current);
        p.getMembers().add(current);
        return new ProjectDto(projects.save(p));
    }

    @Transactional
    public ProjectDto update(Long id, ProjectRequest req, User current) {
        Project p = getProject(id);
        checkCanManage(p, current);
        p.setName(req.getName());
        p.setDescription(req.getDescription());
        return new ProjectDto(projects.save(p));
    }

    @Transactional
    public void delete(Long id, User current) {
        Project p = getProject(id);
        checkCanManage(p, current);
        projects.delete(p);
    }

    @Transactional
    public ProjectDto addMember(Long projectId, Long userId, User current) {
        Project p = getProject(projectId);
        checkCanManage(p, current);
        User member = users.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        p.getMembers().add(member);
        return new ProjectDto(projects.save(p));
    }

    @Transactional
    public ProjectDto removeMember(Long projectId, Long userId, User current) {
        Project p = getProject(projectId);
        checkCanManage(p, current);
        User member = users.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        p.getMembers().remove(member);
        return new ProjectDto(projects.save(p));
    }

    public Project getProject(Long id) {
        return projects.findById(id).orElseThrow(() -> new ResourceNotFoundException("Project not found"));
    }

    public void checkCanView(Project p, User current) {
        if (current.getRole() == Role.ADMIN) return;
        if (p.getOwner().getId().equals(current.getId())) return;
        if (p.getMembers().stream().anyMatch(m -> m.getId().equals(current.getId()))) return;
        throw new AccessDeniedException("You are not a member of this project.");
    }

    public void checkCanManage(Project p, User current) {
        if (current.getRole() == Role.ADMIN) return;
        if (current.getRole() == Role.MANAGER && p.getOwner().getId().equals(current.getId())) return;
        throw new AccessDeniedException("Only the project owner or an admin can do this.");
    }

    public boolean isMember(Project p, User current) {
        if (current.getRole() == Role.ADMIN) return true;
        if (p.getOwner().getId().equals(current.getId())) return true;
        return p.getMembers().stream().anyMatch(m -> m.getId().equals(current.getId()));
    }
}
