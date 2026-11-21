package com.bugtracker.dto;

import com.bugtracker.entity.Project;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class ProjectDto {
    private Long id;
    private String name;
    private String description;
    private LocalDateTime createdDate;
    private UserDto owner;
    private List<UserDto> members;

    public ProjectDto() {}
    public ProjectDto(Project p) {
        this.id = p.getId(); this.name = p.getName(); this.description = p.getDescription();
        this.createdDate = p.getCreatedDate(); this.owner = new UserDto(p.getOwner());
        this.members = p.getMembers().stream().map(UserDto::new).collect(Collectors.toList());
    }
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }
    public UserDto getOwner() { return owner; }
    public void setOwner(UserDto owner) { this.owner = owner; }
    public List<UserDto> getMembers() { return members; }
    public void setMembers(List<UserDto> members) { this.members = members; }
}
