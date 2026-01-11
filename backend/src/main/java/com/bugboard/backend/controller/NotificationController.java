package com.bugboard.backend.controller;

import com.bugboard.backend.model.Notification;
import com.bugboard.backend.notification.NotificationService;
import com.bugboard.backend.service.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final CurrentUserService currentUserService;

    @GetMapping("/unread")
    public ResponseEntity<List<Notification>> getUnread() {
        return ResponseEntity.ok(
                notificationService.getUnreadNotifications(currentUserService.getCurrentUser())
        );
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id, currentUserService.getCurrentUser());
        return ResponseEntity.ok().build();
    }
}