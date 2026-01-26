package com.bugboard.backend.adapters.notification;

import com.bugboard.backend.model.User;

public interface NotificationAdapter {
    void send(User recipient, String subject, String message);
}