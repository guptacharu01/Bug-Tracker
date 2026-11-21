package com.bugtracker.service;

import com.bugtracker.dto.AuthRequest;
import com.bugtracker.dto.AuthResponse;
import com.bugtracker.dto.RegisterRequest;
import com.bugtracker.dto.UserDto;
import com.bugtracker.entity.Role;
import com.bugtracker.entity.User;
import com.bugtracker.exception.ResourceNotFoundException;
import com.bugtracker.repository.UserRepository;
import com.bugtracker.security.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authManager;

    public AuthService(UserRepository users, PasswordEncoder encoder, JwtUtil jwtUtil, AuthenticationManager authManager) {
        this.users = users; this.encoder = encoder; this.jwtUtil = jwtUtil; this.authManager = authManager;
    }

    public AuthResponse register(RegisterRequest req) {
        if (users.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("An account with this email already exists.");
        }
        // Only an Admin can create Admin or Manager accounts.
        // Anyone else registering gets the Developer role.
        Role role = Role.DEVELOPER;
        if (req.getRole() != null && req.getRole() != Role.DEVELOPER && isCurrentUserAdmin()) {
            role = req.getRole();
        }
        User u = new User();
        u.setName(req.getName());
        u.setEmail(req.getEmail());
        u.setPassword(encoder.encode(req.getPassword()));
        u.setRole(role);
        users.save(u);
        return new AuthResponse(jwtUtil.generateToken(u.getEmail()), u.getId(), u.getName(), u.getEmail(), u.getRole().name());
    }

    public AuthResponse login(AuthRequest req) {
        authManager.authenticate(new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));
        User u = users.findByEmail(req.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return new AuthResponse(jwtUtil.generateToken(u.getEmail()), u.getId(), u.getName(), u.getEmail(), u.getRole().name());
    }

    public UserDto me(String email) {
        User u = users.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return new UserDto(u);
    }

    public User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return users.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private boolean isCurrentUserAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.isAuthenticated()
                && auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }
}
