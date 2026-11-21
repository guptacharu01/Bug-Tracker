package com.bugtracker.config;

import com.bugtracker.entity.Role;
import com.bugtracker.entity.User;
import com.bugtracker.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminSeeder {
    // Demo accounts, created only when the database is empty.
    // Change these passwords after your first login.
    @Bean
    public CommandLineRunner seedUsers(UserRepository users, PasswordEncoder encoder) {
        return args -> {
            if (users.count() == 0) {
                create(users, encoder, "Admin User", "admin@bugtracker.com", "admin123", Role.ADMIN);
                create(users, encoder, "Priya Manager", "manager@bugtracker.com", "manager123", Role.MANAGER);
                create(users, encoder, "Rahul Developer", "dev@bugtracker.com", "dev123", Role.DEVELOPER);
            }
        };
    }

    private void create(UserRepository users, PasswordEncoder encoder, String name, String email, String password, Role role) {
        User u = new User();
        u.setName(name);
        u.setEmail(email);
        u.setPassword(encoder.encode(password));
        u.setRole(role);
        users.save(u);
    }
}
