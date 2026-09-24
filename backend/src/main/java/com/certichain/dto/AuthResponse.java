package com.certichain.dto;

public class AuthResponse {
    private String token;
    private String email;
    private String fullName;
    private String role;
    private Long institutionId;
    private String institutionName;

    public AuthResponse() {}

    public AuthResponse(String token, String email, String fullName, String role,
                        Long institutionId, String institutionName) {
        this.token = token;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
        this.institutionId = institutionId;
        this.institutionName = institutionName;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public Long getInstitutionId() { return institutionId; }
    public void setInstitutionId(Long institutionId) { this.institutionId = institutionId; }

    public String getInstitutionName() { return institutionName; }
    public void setInstitutionName(String institutionName) { this.institutionName = institutionName; }
}
