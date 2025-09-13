package com.project.OnlineBookStore.controller;

import com.project.OnlineBookStore.model.User;
import com.project.OnlineBookStore.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserRepository repo;

    public UserController(UserRepository repo) {
        this.repo = repo;
    }

    @GetMapping("/profile")
    public ResponseEntity<?> profile(Authentication authentication) {
        String email = authentication.getName();
        User u = repo.findByEmail(email).orElseThrow();
        return ResponseEntity.ok(Map.of(
                "email", u.getEmail(),
                "fullName", u.getFullName(),
                "role", u.getRole().name()
        ));
    }
}