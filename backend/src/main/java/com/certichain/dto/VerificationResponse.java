package com.certichain.dto;

import java.time.LocalDateTime;

public class VerificationResponse {
    private boolean valid;
    private String status; // VALID, INVALID, REVOKED
    private String certificateUid;
    private String studentName;
    private String courseName;
    private String grade;
    private String issueDate;
    private String institutionName;
    private String certificateHash;
    private String txHash;
    private Long blockNumber;
    private LocalDateTime issueTimestamp;
    private String revocationReason;
    private LocalDateTime revokedAt;
    private String message;

    public VerificationResponse() {}

    public static VerificationResponse invalid(String message) {
        VerificationResponse r = new VerificationResponse();
        r.setValid(false);
        r.setStatus("INVALID");
        r.setMessage(message);
        return r;
    }

    public static VerificationResponse revoked(String message) {
        VerificationResponse r = new VerificationResponse();
        r.setValid(false);
        r.setStatus("REVOKED");
        r.setMessage(message);
        return r;
    }

    // Getters and Setters
    public boolean isValid() { return valid; }
    public void setValid(boolean valid) { this.valid = valid; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCertificateUid() { return certificateUid; }
    public void setCertificateUid(String certificateUid) { this.certificateUid = certificateUid; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getCourseName() { return courseName; }
    public void setCourseName(String courseName) { this.courseName = courseName; }

    public String getGrade() { return grade; }
    public void setGrade(String grade) { this.grade = grade; }

    public String getIssueDate() { return issueDate; }
    public void setIssueDate(String issueDate) { this.issueDate = issueDate; }

    public String getInstitutionName() { return institutionName; }
    public void setInstitutionName(String institutionName) { this.institutionName = institutionName; }

    public String getCertificateHash() { return certificateHash; }
    public void setCertificateHash(String certificateHash) { this.certificateHash = certificateHash; }

    public String getTxHash() { return txHash; }
    public void setTxHash(String txHash) { this.txHash = txHash; }

    public Long getBlockNumber() { return blockNumber; }
    public void setBlockNumber(Long blockNumber) { this.blockNumber = blockNumber; }

    public LocalDateTime getIssueTimestamp() { return issueTimestamp; }
    public void setIssueTimestamp(LocalDateTime issueTimestamp) { this.issueTimestamp = issueTimestamp; }

    public String getRevocationReason() { return revocationReason; }
    public void setRevocationReason(String revocationReason) { this.revocationReason = revocationReason; }

    public LocalDateTime getRevokedAt() { return revokedAt; }
    public void setRevokedAt(LocalDateTime revokedAt) { this.revokedAt = revokedAt; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
