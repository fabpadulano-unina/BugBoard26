package com.bugboard.backend.notification;

import com.bugboard.backend.model.Notification;
import com.bugboard.backend.model.User;
import com.bugboard.backend.repository.NotificationRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    // Inietta tutti gli adapter disponibili (Email, DB, ecc.)
    private final List<NotificationAdapter> adapters;
    private final NotificationRepository notificationRepository;

    /**
     * Invia una notifica attraverso tutti i canali configurati (Adapter Pattern).
     */
    public void notifyUser(User recipient, String subject, String message) {
        if (recipient == null) return;

        for (NotificationAdapter adapter : adapters) {
            adapter.send(recipient, subject, message);
        }
    }

    /**
     * Recupera le notifiche non lette per l'utente specificato.
     */
    @Transactional(readOnly = true)
    public List<Notification> getUnreadNotifications(User user) {
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(user.getId());
    }

    /**
     * Marca una notifica come letta, eseguendo i controlli di sicurezza.
     */
    @Transactional
    public void markAsRead(Long id, User currentUser) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Notifica non trovata"));

        if (!notification.getUser().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Non hai i permessi per modificare questa notifica.");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }
}