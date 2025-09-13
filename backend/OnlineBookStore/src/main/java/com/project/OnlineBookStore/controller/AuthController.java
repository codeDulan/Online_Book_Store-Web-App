package com.project.OnlineBookStore.controller;

import com.project.OnlineBookStore.dto.LoginRequest;
import com.project.OnlineBookStore.dto.RegisterRequest;
import com.project.OnlineBookStore.model.Role;
import com.project.OnlineBookStore.model.User;
import com.project.OnlineBookStore.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    public AuthController(UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already in use"));
        }
        User u = new User();
        u.setFullName(req.getFullName());
        u.setEmail(req.getEmail());
        u.setPassword(passwordEncoder.encode(req.getPassword()));
        u.setRole(Role.ROLE_USER);
        userRepository.save(u);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "User created"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req, HttpServletRequest request) {
        try {
            UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword());
            Authentication auth = authenticationManager.authenticate(authToken);

            // set auth in security context -> session will be created
            SecurityContextHolder.getContext().setAuthentication(auth);
            HttpSession session = request.getSession(true); // create session and store security context

            // optional: return basic user info
            User u = userRepository.findByEmail(req.getEmail()).orElseThrow();
            return ResponseEntity.ok(Map.of(
                    "message", "Login successful",
                    "email", u.getEmail(),
                    "fullName", u.getFullName(),
                    "role", u.getRole().name()
            ));
        } catch (AuthenticationException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error","Invalid credentials"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(Map.of("message", "Logged out"));
    }
}


