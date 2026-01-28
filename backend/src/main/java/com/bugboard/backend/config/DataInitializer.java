package com.bugboard.backend.config;

import com.bugboard.backend.model.Role;
import com.bugboard.backend.model.User;
import com.bugboard.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor; // Aggiungi questo
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder; // Aggiungi questo
import org.springframework.beans.factory.annotation.Value;



@Configuration
@Slf4j
@RequiredArgsConstructor
public class DataInitializer {

    private final PasswordEncoder passwordEncoder;

    @Value("${app.default-password}")
    private String defaultPassword;
    @Bean
    public CommandLineRunner loadData(UserRepository userRepository) {
        return args -> {
            String encodedPassword = passwordEncoder.encode(defaultPassword);

            if (userRepository.findByEmail("admin@bugboard.com").isEmpty()) {
                User admin = User.builder()
                        .email("admin@bugboard.com")
                        .password(encodedPassword)
                        .name("Super Admin")
                        .role(Role.ADMIN)
                        .build();

                userRepository.save(admin);
                log.info(" Admin default creato: admin@bugboard.com");
            }

            if (userRepository.findByEmail("user@bugboard.com").isEmpty()) {
                User user = User.builder()
                        .email("user@bugboard.com")
                        .password(encodedPassword)
                        .name("Mario Rossi")
                        .role(Role.USER)
                        .build();

                userRepository.save(user);
                log.info("User demo creato: user@bugboard.com");
            }
        };
    }
}