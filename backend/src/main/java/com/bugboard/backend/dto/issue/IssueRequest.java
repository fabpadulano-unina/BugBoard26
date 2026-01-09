package com.bugboard.backend.dto.issue;

import com.bugboard.backend.model.IssueType;
import com.bugboard.backend.model.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class IssueRequest {

    @NotBlank(message = "Il titolo è obbligatorio")
    private String title;

    @NotBlank(message = "La descrizione è obbligatoria")
    private String description;

    @NotNull(message = "Il tipo è obbligatorio")
    private IssueType type;

    // La priorità è opzionale (Punto 2)
    private Priority priority;

    // Scadenza opzionale (Punto 18)
    private LocalDate deadline;

    // Assegnatario opzionale (Punto 4)
    private Long assigneeId;
}