package com.bugboard.backend.dto.user;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserSummary {
    private Long id;
    private String name;
    private String email;
}