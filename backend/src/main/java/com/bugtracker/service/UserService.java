package com.bugtracker.service;

import com.bugtracker.dto.RoleUpdateRequest;
import com.bugtracker.dto.UserDto;
import com.bugtracker.entity.User;
import com.bugtracker.exception.ResourceNotFoundException;
import com.bugtracker.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {
    private final UserRepository users;

    public UserService(UserRepository users) {
        this.users = users;
    }

    public List<UserDto> findAll() {
        return users.findAll().stream().map(UserDto::new).collect(Collectors.toList());
    }

    public UserDto updateRole(Long id, RoleUpdateRequest req) {
        User u = users.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        u.setRole(req.getRole());
        return new UserDto(users.save(u));
    }
}
