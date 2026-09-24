package com.certichain.dto;

import jakarta.validation.constraints.NotBlank;

public class RevokeRequest {

    @NotBlank(message = "Revocation reason is required")
    private String reason;

    public RevokeRequest() {}

    public RevokeRequest(String reason) {
        this.reason = reason;
    }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
