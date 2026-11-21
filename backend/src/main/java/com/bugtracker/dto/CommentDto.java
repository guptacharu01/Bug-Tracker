package com.bugtracker.dto;

import com.bugtracker.entity.Comment;
import java.time.LocalDateTime;

public class CommentDto {
    private Long id;
    private String text;
    private UserDto author;
    private LocalDateTime createdAt;

    public CommentDto() {}
    public CommentDto(Comment c) {
        this.id = c.getId(); this.text = c.getText();
        this.author = new UserDto(c.getAuthor()); this.createdAt = c.getCreatedAt();
    }
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
    public UserDto getAuthor() { return author; }
    public void setAuthor(UserDto author) { this.author = author; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
