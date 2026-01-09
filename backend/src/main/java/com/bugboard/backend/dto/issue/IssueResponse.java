package com.bugboard.backend.dto.issue;

import com.bugboard.backend.model.IssueState;
import com.bugboard.backend.model.IssueType;
import com.bugboard.backend.model.Priority;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class IssueResponse {
    private Long id;
    private String title;
    private String description;
    private IssueState state;
    private IssueType type;
    private Priority priority;
    private LocalDate deadline;

    // Restituiamo solo i nomi/email, non tutto l'oggetto User
    private Long reporterId;
    private String reporterName;

    private Long assigneeId;
    private String assigneeName;

    private LocalDateTime createdAt;
}