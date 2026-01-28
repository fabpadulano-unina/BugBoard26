package com.bugboard.backend.service;

import com.bugboard.backend.dto.issue.IssueRequest;
import com.bugboard.backend.dto.issue.IssueResponse;
import com.bugboard.backend.exception.FileStorageException;
import com.bugboard.backend.exception.ResourceNotFoundException;
import com.bugboard.backend.model.Issue;
import com.bugboard.backend.model.IssueState;
import com.bugboard.backend.model.Role;
import com.bugboard.backend.model.User;
import com.bugboard.backend.repository.IssueRepository;
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

    public static final String ISSUE_NON_TROVATA_CON_ID = "ISSUE_NON_TROVATA_CON_ID";
    private final IssueRepository issueRepository;
    private final UserService userService;
    private final CurrentUserService currentUserService;
    private final NotificationService notificationService;

    @Transactional
    public IssueResponse createIssue(IssueRequest request, MultipartFile file) {
        User reporter = currentUserService.getCurrentUser();
        User assignee = null;
        if (request.getAssigneeId() != null) {
            assignee = userService.getUserById(request.getAssigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assegnatario non trovato con ID: " + request.getAssigneeId()));
        }

        byte[] attachmentBytes = null;
        String attachmentName = null;
        if (file != null && !file.isEmpty()) {
            try {
                attachmentBytes = file.getBytes();
                attachmentName = file.getOriginalFilename();
            } catch (IOException e) {
                throw new FileStorageException("Impossibile caricare il file allegato", e);
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
                .orElseThrow(() -> new ResourceNotFoundException(ISSUE_NON_TROVATA_CON_ID + id));

        User currentUser = currentUserService.getCurrentUser();

        validateUpdatePermissions(issue, currentUser);

        issue.setTitle(request.getTitle());
        issue.setDescription(request.getDescription());
        issue.setType(request.getType());
        issue.setPriority(request.getPriority());

        if (currentUser.getRole() == Role.ADMIN) {
            issue.setDeadline(request.getDeadline());
            handleAssignmentChange(issue, request.getAssigneeId(), currentUser);
        }

        updateAttachment(issue, file);

        return mapToResponse(issueRepository.save(issue));
    }


    private void validateUpdatePermissions(Issue issue, User currentUser) {
        boolean isAdmin = currentUser.getRole() == Role.ADMIN;
        boolean isAssignee = issue.getAssignee() != null && issue.getAssignee().getId().equals(currentUser.getId());

        if (!isAdmin && !isAssignee) {
            throw new AccessDeniedException("Non hai i permessi per modificare questa issue.");
        }
    }

    private void handleAssignmentChange(Issue issue, Long newAssigneeId, User currentUser) {
        if (newAssigneeId == null) {
            issue.setAssignee(null);
            return;
        }

        Long oldAssigneeId = issue.getAssignee() != null ? issue.getAssignee().getId() : null;

        User newAssignee = userService.getUserById(newAssigneeId)
                .orElseThrow(() -> new ResourceNotFoundException("Assegnatario non trovato con ID: " + newAssigneeId));

        issue.setAssignee(newAssignee);

        if (!newAssignee.getId().equals(oldAssigneeId) && !newAssignee.getId().equals(currentUser.getId())) {
            notificationService.notifyUser(newAssignee,
                    "Assegnazione Modificata",
                    "Il ticket #" + issue.getId() + " è stato assegnato a te da " + currentUser.getName());
        }
    }

    private void updateAttachment(Issue issue, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return;
        }
        try {
            issue.setAttachment(file.getBytes());
            issue.setAttachmentName(file.getOriginalFilename());
        } catch (IOException e) {
            throw new FileStorageException("Errore durante l'aggiornamento del file", e);
        }
    }
    @Transactional(readOnly = true)
    public byte[] getAttachment(Long id) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Issue non trovata per il download allegato"));

        return issue.getAttachment();
    }

    @Transactional
    public IssueResponse updateState(Long issueId, IssueState newState) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new ResourceNotFoundException(ISSUE_NON_TROVATA_CON_ID + issueId));

        issue.setState(newState);
        return mapToResponse(issueRepository.save(issue));
    }

    @Transactional(readOnly = true)
    public List<IssueResponse> getAllIssues() {
        return issueRepository.findAll().stream().map(this::mapToResponse).toList();
    }

    @Transactional(readOnly = true)
    public IssueResponse getIssueById(Long id) {
        return mapToResponse(issueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ISSUE_NON_TROVATA_CON_ID + id)));
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