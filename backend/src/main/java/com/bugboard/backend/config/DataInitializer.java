package com.bugboard.backend.config;

import com.bugboard.backend.model.Role;
import com.bugboard.backend.model.User;
import com.bugboard.backend.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@Slf4j // <-- Questa annotazione genera automaticamente il logger
public class DataInitializer {

    @Bean
    public CommandLineRunner loadData(UserRepository userRepository) {
        return args -> {
            // Quando faremo la Security configureremo l'encoder vero
            String rawPassword = "password123";

            if (userRepository.findByEmail("admin@bugboard.com").isEmpty()) {
                User admin = User.builder()
                        .email("admin@bugboard.com")
                        .password(rawPassword)
                        .name("Super Admin")
                        .role(Role.ADMIN)
                        .build();

                userRepository.save(admin);
                log.info("Admin default creato con successo: {}", admin.getEmail());
            } else {
                log.debug("Utente Admin già presente, skip creazione.");
            }

            if (userRepository.findByEmail("user@bugboard.com").isEmpty()) {
                User user = User.builder()
                        .email("user@bugboard.com")
                        .password(rawPassword)
                        .name("Mario Rossi")
                        .role(Role.USER)
                        .build();

                userRepository.save(user);
                log.info("User demo creato con successo: {}", user.getEmail());
            }
        };
    }
}