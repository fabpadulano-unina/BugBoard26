package com.bugboard.backend.service;

import com.bugboard.backend.model.User;
import com.bugboard.backend.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CurrentUserService {

    private final UserRepository userRepository;

    /**
     * Recupera l'entità User dell'utente attualmente loggato.
     * Lancia un'eccezione se l'utente non viene trovato (es. token valido ma utente cancellato dal DB).
     */
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new EntityNotFoundException("Nessun utente autenticato trovato nel contesto");
        }

        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Utente loggato non trovato nel Database: " + email));
    }
}