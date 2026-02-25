package com.bugboard.backend;

import com.bugboard.backend.dto.issue.IssueRequest;
import com.bugboard.backend.dto.issue.IssueResponse;
import com.bugboard.backend.exception.FileStorageException;
import com.bugboard.backend.exception.ResourceNotFoundException;
import com.bugboard.backend.model.Issue;
import com.bugboard.backend.model.IssueType;
import com.bugboard.backend.model.User;
import com.bugboard.backend.service.CurrentUserService;
import com.bugboard.backend.service.IssueService;
import com.bugboard.backend.service.NotificationService;
import com.bugboard.backend.service.UserService;
import com.bugboard.backend.repository.IssueRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class IssueServiceTest {
    @Mock private IssueRepository issueRepository;
    @Mock private UserService userService;
    @Mock private CurrentUserService currentUserService;
    @Mock private NotificationService notificationService;
    @InjectMocks private IssueService issueService;

    @Test
    void createIssue_ShouldSaveAndNotify_WhenAssigneeExists() throws IOException {
        IssueRequest request = new IssueRequest();
        request.setTitle("Bug Login");
        request.setDescription("Il sistema crasha all’avvio");
        request.setType(IssueType.BUG);
        request.setAssigneeId(10L);

        MultipartFile file = mock(MultipartFile.class);
        when(file.isEmpty()).thenReturn(false);
        when(file.getBytes()).thenReturn(new byte[]{1, 2, 3});
        when(file.getOriginalFilename()).thenReturn("log.txt");

        User reporter = User.builder().id(1L).email("admin@test.com").build();
        User assignee = User.builder().id(10L).email("dev@test.com").build();

        when(currentUserService.getCurrentUser()).thenReturn(reporter);

        when(userService.getUserById(10L)).thenReturn(Optional.of(assignee));

        when(issueRepository.save(any(Issue.class)))
                .thenAnswer(i -> i.getArguments()[0]);

        IssueResponse response = issueService.createIssue(request, file);

        verify(issueRepository).save(any(Issue.class));
        verify(notificationService).notifyUser(eq(assignee),
                contains("Nuova Assegnazione"), anyString());
        assertEquals("Bug Login", response.getTitle());
    }

    @Test
    void createIssue_ShouldThrowException_WhenAssigneeNotFound() {
        IssueRequest request = new IssueRequest();
        request.setTitle("Bug Login");
        request.setAssigneeId(99L);

        User reporter = User.builder().id(1L).build();
        when(currentUserService.getCurrentUser()).thenReturn(reporter);

        when(userService.getUserById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            issueService.createIssue(request, null);
        });

        verify(issueRepository, never()).save(any(Issue.class));
    }

    @Test
    void createIssue_ShouldThrowFileStorageException_WhenFileReadFails() throws IOException {
        IssueRequest request = new IssueRequest();
        request.setTitle("Bug Login");

        MultipartFile file = mock(MultipartFile.class);
        when(file.isEmpty()).thenReturn(false);
        when(file.getBytes()).thenThrow(new IOException("Errore di lettura disco"));

        User reporter = User.builder().id(1L).build();
        when(currentUserService.getCurrentUser()).thenReturn(reporter);

        assertThrows(FileStorageException.class, () -> {
            issueService.createIssue(request, file);
        });

        verify(issueRepository, never()).save(any(Issue.class));
    }
}