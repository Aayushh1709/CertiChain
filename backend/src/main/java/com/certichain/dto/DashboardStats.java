package com.certichain.dto;

public class DashboardStats {
    private long totalCertificates;
    private long validCertificates;
    private long revokedCertificates;
    private long totalInstitutions;
    private long pendingInstitutions;
    private long approvedInstitutions;
    private long totalStudents;
    private long totalVerifications;

    public DashboardStats() {}

    // Getters and Setters
    public long getTotalCertificates() { return totalCertificates; }
    public void setTotalCertificates(long totalCertificates) { this.totalCertificates = totalCertificates; }

    public long getValidCertificates() { return validCertificates; }
    public void setValidCertificates(long validCertificates) { this.validCertificates = validCertificates; }

    public long getRevokedCertificates() { return revokedCertificates; }
    public void setRevokedCertificates(long revokedCertificates) { this.revokedCertificates = revokedCertificates; }

    public long getTotalInstitutions() { return totalInstitutions; }
    public void setTotalInstitutions(long totalInstitutions) { this.totalInstitutions = totalInstitutions; }

    public long getPendingInstitutions() { return pendingInstitutions; }
    public void setPendingInstitutions(long pendingInstitutions) { this.pendingInstitutions = pendingInstitutions; }

    public long getApprovedInstitutions() { return approvedInstitutions; }
    public void setApprovedInstitutions(long approvedInstitutions) { this.approvedInstitutions = approvedInstitutions; }

    public long getTotalStudents() { return totalStudents; }
    public void setTotalStudents(long totalStudents) { this.totalStudents = totalStudents; }

    public long getTotalVerifications() { return totalVerifications; }
    public void setTotalVerifications(long totalVerifications) { this.totalVerifications = totalVerifications; }
}
