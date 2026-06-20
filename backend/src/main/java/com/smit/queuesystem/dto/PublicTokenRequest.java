package com.smit.queuesystem.dto;

import com.smit.queuesystem.enums.TokenType;
import lombok.Data;

@Data
public class PublicTokenRequest {
    private String customerName;
    private String customerPhone;
    private String customerEmail;
    private String notes;
    private TokenType tokenType;
}
