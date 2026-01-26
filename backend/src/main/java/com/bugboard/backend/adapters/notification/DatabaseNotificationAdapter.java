package com.bugboard.backend.adapters.notification;

import com.bugboard.backend.model.Notification;
import com.bugboard.backend.model.User;
import com.bugboard.backend.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DatabaseNotificationAdapter implements NotificationAdapter {

    private final NotificationRepository notificationRepository;

    @Override
    public void send(User recipient, String subject, String message) {
        Notification notification = Notification.builder()
                .user(recipient)
                .message(subject + ": " + message)
                .isRead(false)
                .build();

        notificationRepository.save(notification);
    }
}