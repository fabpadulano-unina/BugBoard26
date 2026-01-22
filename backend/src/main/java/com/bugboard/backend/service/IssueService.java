package com.bugboard.backend.service;

import com.bugboard.backend.dto.issue.IssueRequest;
import com.bugboard.backend.dto.issue.IssueResponse;
import com.bugboard.backend.model.Issue;
import com.bugboard.backend.model.IssueState;
import com.bugboard.backend.model.Role;
import com.bugboard.backend.model.User;
import com.bugboard.backend.notification.NotificationService; // IMPORTANTE
import com.bugboard.backend.repository.IssueRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class IssueService {

    private final IssueRepository issueRepository;
    private final UserService userService;
    private final CurrentUserService currentUserService;
    private final NotificationService notificationService; // INIEZIONE DEL NOTIFICATORE

    @Transactional
    public IssueResponse createIssue(IssueRequest request, MultipartFile file) {
        User reporter = currentUserService.getCurrentUser();
        User assignee = null;
        if (request.getAssigneeId() != null) {
            assignee = userService.getUserById(request.getAssigneeId())
                    .orElseThrow(() -> new EntityNotFoundException("Assegnatario non trovato"));
        }

        byte[] attachmentBytes = null;
        String attachmentName = null;
        if (file != null && !file.isEmpty()) {
            try {
                attachmentBytes = file.getBytes();
                attachmentName = file.getOriginalFilename();
            } catch (IOException e) {
                throw new RuntimeException("Errore file", e);
            }
        }

        Issue issue = Issue.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .type(request.getType())
                .priority(request.getPriority())
                .deadline(request.getDeadline())
                .state(IssueState.TODO)
                .reporter(reporter)
                .assignee(assignee)
                .attachment(attachmentBytes)
                .attachmentName(attachmentName)
                .build();

        Issue savedIssue = issueRepository.save(issue);

        // --- PUNTO 4: NOTIFICA ASSEGNAZIONE ---
        if (assignee != null && !assignee.getId().equals(reporter.getId())) {
            notificationService.notifyUser(assignee,
                    "Nuova Assegnazione",
                    "Sei stato assegnato al ticket #" + savedIssue.getId() + ": " + savedIssue.getTitle());
        }

        return mapToResponse(savedIssue);
    }

    @Transactional
    public IssueResponse updateIssueDetails(Long id, IssueRequest request, MultipartFile file) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Issue non trovata"));

        User currentUser = currentUserService.getCurrentUser();
        boolean isAdmin = currentUser.getRole() == Role.ADMIN;
        boolean isAssignee = issue.getAssignee() != null && issue.getAssignee().getId().equals(currentUser.getId());

        if (!isAdmin && !isAssignee) {
            throw new AccessDeniedException("Non hai i permessi per modificare questa issue.");
        }

        Long oldAssigneeId = issue.getAssignee() != null ? issue.getAssignee().getId() : null;
        Long newAssigneeId = request.getAssigneeId();

        issue.setTitle(request.getTitle());
        issue.setDescription(request.getDescription());
        issue.setType(request.getType());
        issue.setPriority(request.getPriority());

        if (isAdmin) {
            issue.setDeadline(request.getDeadline());

            if (newAssigneeId != null) {
                User newAssignee = userService.getUserById(newAssigneeId)
                        .orElseThrow(() -> new EntityNotFoundException("Assegnatario non trovato"));
                issue.setAssignee(newAssignee);

                // --- PUNTO 4: NOTIFICA CAMBIO ASSEGNAZIONE ---
                if (!newAssignee.getId().equals(oldAssigneeId) && !newAssignee.getId().equals(currentUser.getId())) {
                    notificationService.notifyUser(newAssignee,
                            "Assegnazione Modificata",
                            "Il ticket #" + issue.getId() + " è stato assegnato a te da " + currentUser.getName());
                }
            } else {
                issue.setAssignee(null);
            }
        }

        if (file != null && !file.isEmpty()) {
            try {
                issue.setAttachment(file.getBytes());
                issue.setAttachmentName(file.getOriginalFilename());
            } catch (IOException e) {
                throw new RuntimeException("Errore aggiornamento file", e);
            }
        }

        return mapToResponse(issueRepository.save(issue));
    }

    @Transactional(readOnly = true)
    public byte[] getAttachment(Long id) {
        Issue issue = issueRepository.findById(id).orElse(null);
        return issue != null ? issue.getAttachment() : null;
    }

    @Transactional
    public IssueResponse updateState(Long issueId, IssueState newState) {
        Issue issue = issueRepository.findById(issueId).orElseThrow(() -> new EntityNotFoundException("Issue non trovata"));
        issue.setState(newState);
        return mapToResponse(issueRepository.save(issue));
    }

    @Transactional(readOnly = true)
    public List<IssueResponse> getAllIssues() {
        return issueRepository.findAll().stream().map(this::mapToResponse).toList();
    }

    @Transactional(readOnly = true)
    public IssueResponse getIssueById(Long id) {
        return mapToResponse(issueRepository.findById(id).orElseThrow());
    }

    private IssueResponse mapToResponse(Issue issue) {
        return IssueResponse.builder()
                .id(issue.getId())
                .title(issue.getTitle())
                .description(issue.getDescription())
                .state(issue.getState())
                .type(issue.getType())
                .priority(issue.getPriority())
                .deadline(issue.getDeadline())
                .reporterId(issue.getReporter().getId())
                .reporterName(issue.getReporter().getName())
                .assigneeId(issue.getAssignee() != null ? issue.getAssignee().getId() : null)
                .assigneeName(issue.getAssignee() != null ? issue.getAssignee().getName() : null)
                .createdAt(issue.getCreatedAt())
                .build();
    }
}