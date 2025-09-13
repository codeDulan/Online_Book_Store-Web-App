package com.project.OnlineBookStore.init;

import com.project.OnlineBookStore.model.Role;
import com.project.OnlineBookStore.model.User;
import com.project.OnlineBookStore.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.password}")
    private String adminPassword;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        userRepository.findByEmail(adminEmail).ifPresentOrElse(
                u -> { /* admin exists */ },
                () -> {
                    User admin = new User();
                    admin.setFullName("Admin User");
                    admin.setEmail(adminEmail);
                    admin.setPassword(passwordEncoder.encode(adminPassword));
                    admin.setRole(Role.ROLE_ADMIN);
                    admin.setEnabled(true);
                    userRepository.save(admin);
                    System.out.println("Admin user created: " + adminEmail);
                }
        );
    }
}
