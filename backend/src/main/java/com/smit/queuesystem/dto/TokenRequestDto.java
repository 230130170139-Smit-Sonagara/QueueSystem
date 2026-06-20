package com.smit.queuesystem.dto;

import lombok.Data;

@Data
public class TokenRequestDto {
    private String customerName;
    private String customerPhone;
    private Long userId; // optional
}
