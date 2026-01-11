package com.bugboard.backend.notification;

import com.bugboard.backend.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class EmailNotificationAdapter implements NotificationAdapter {

    private final JavaMailSender mailSender;

    @Override
    public void send(User recipient, String subject, String message) {
        try {
            SimpleMailMessage email = new SimpleMailMessage();
            email.setTo(recipient.getEmail());
            email.setSubject(subject);
            email.setText(message);
            email.setFrom("noreply@bugboard.com"); // Configura un mittente valido

            mailSender.send(email);
            log.info("Email inviata con successo a: {}", recipient.getEmail());

        } catch (Exception e) {
            // Non blocchiamo l'applicazione se l'email fallisce, ma logghiamo l'errore
            log.error("Errore invio email a {}: {}", recipient.getEmail(), e.getMessage());
        }
    }
}