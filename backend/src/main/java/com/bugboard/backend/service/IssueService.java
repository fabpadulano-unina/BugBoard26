package com.bugboard.backend.service;

import com.bugboard.backend.dto.issue.IssueRequest;
import com.bugboard.backend.dto.issue.IssueResponse;
import com.bugboard.backend.model.Issue;
import com.bugboard.backend.model.IssueState;
import com.bugboard.backend.model.Role;
import com.bugboard.backend.model.User;
import com.bugboard.backend.repository.IssueRepository;
import com.bugboard.backend.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.web.multipart.MultipartFile; // Importante
import java.io.IOException;

@Service
@RequiredArgsConstructor
public class IssueService {

    private final IssueRepository issueRepository;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;

    @Transactional
    public IssueResponse createIssue(IssueRequest request) {
        User reporter = currentUserService.getCurrentUser();

        User assignee = null;
        if (request.getAssigneeId() != null) {
            assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new EntityNotFoundException("Assegnatario non trovato con ID: " + request.getAssigneeId()));
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
                .build();

        Issue savedIssue = issueRepository.save(issue);

        return mapToResponse(savedIssue);
    }

    @Transactional
    public IssueResponse createIssue(IssueRequest request, MultipartFile file) { // Aggiunto parametro file
        User reporter = currentUserService.getCurrentUser();

        User assignee = null;
        if (request.getAssigneeId() != null) {
            assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new EntityNotFoundException("Assegnatario non trovato"));
        }

        // Gestione Immagine
        byte[] attachmentBytes = null;
        String attachmentName = null;

        if (file != null && !file.isEmpty()) {
            try {
                attachmentBytes = file.getBytes();
                attachmentName = file.getOriginalFilename();
            } catch (IOException e) {
                throw new RuntimeException("Errore nella lettura del file allegato", e);
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
                // Salviamo l'immagine
                .attachment(attachmentBytes)
                .attachmentName(attachmentName)
                .build();

        Issue savedIssue = issueRepository.save(issue);

        return mapToResponse(savedIssue);
    }

    @Transactional
    public IssueResponse updateState(Long issueId, IssueState newState) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new EntityNotFoundException("Issue non trovata"));

        User currentUser = currentUserService.getCurrentUser();

        boolean isAssignee = issue.getAssignee() != null && issue.getAssignee().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() == Role.ADMIN;

        if (!isAssignee && !isAdmin) {
            throw new AccessDeniedException("Solo l'assegnatario può modificare lo stato di questa issue.");
        }

        issue.setState(newState);
        Issue saved = issueRepository.save(issue);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<IssueResponse> getAllIssues() {
        return issueRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public IssueResponse updateIssueDetails(Long id, IssueRequest request) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Issue non trovata"));

        User currentUser = currentUserService.getCurrentUser();
        boolean isAdmin = currentUser.getRole() == Role.ADMIN;
        boolean isAssignee = issue.getAssignee() != null && issue.getAssignee().getId().equals(currentUser.getId());

        // PUNTO 9: Controllo accesso generico
        if (!isAdmin && !isAssignee) {
            throw new AccessDeniedException("Non hai i permessi per modificare questa issue.");
        }

        issue.setTitle(request.getTitle());
        issue.setDescription(request.getDescription());
        issue.setType(request.getType());
        issue.setPriority(request.getPriority());

        // PUNTO 4 e 18: Solo ADMIN può cambiare Assegnatario e Scadenza
        if (isAdmin) {
            issue.setDeadline(request.getDeadline());

            if (request.getAssigneeId() != null) {
                User assignee = userRepository.findById(request.getAssigneeId())
                        .orElseThrow(() -> new EntityNotFoundException("Assegnatario non trovato"));
                issue.setAssignee(assignee);
            } else {
                issue.setAssignee(null); // Rimuovi assegnazione
            }
        }

        return mapToResponse(issueRepository.save(issue));
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