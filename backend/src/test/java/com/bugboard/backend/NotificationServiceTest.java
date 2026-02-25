package com.bugboard.backend;

import com.bugboard.backend.adapters.notification.NotificationAdapter;
import com.bugboard.backend.model.User;
import com.bugboard.backend.repository.NotificationRepository;
import com.bugboard.backend.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;

import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock private NotificationAdapter emailAdapter;
    @Mock private NotificationAdapter dbAdapter;

    @Mock private NotificationRepository notificationRepository;

    private NotificationService notificationService;

    @BeforeEach
    void setUp() {
        List<NotificationAdapter> adapters = Arrays.asList(emailAdapter, dbAdapter);

        notificationService = new NotificationService(adapters, notificationRepository);
    }

    @Test
    void notifyUser_ShouldDelegateToAllAdapters() {
        User user = new User();
        String subject = "Test Subject";
        String msg = "Hello World";

        notificationService.notifyUser(user, subject, msg);

        // Verifica chiamata su ENTRAMBI gli adapter
        verify(emailAdapter, times(1)).send(user, subject, msg);
        verify(dbAdapter, times(1)).send(user, subject, msg);
    }

    @Test
    void notifyUser_ShouldDoNothing_WhenRecipientIsNull() {
        notificationService.notifyUser(null, "Test Subject", "Hello");

        verify(emailAdapter, never()).send(any(), anyString(), anyString());
        verify(dbAdapter, never()).send(any(), anyString(), anyString());
    }

    @Test
    void notifyUser_ShouldNotThrowException_WhenAdapterListIsEmpty() {
        NotificationService emptyService = new NotificationService(List.of(), notificationRepository);
        User user = new User();

        assertDoesNotThrow(() -> {
            emptyService.notifyUser(user, "Test Subject", "Hello");
        });
    }
}
