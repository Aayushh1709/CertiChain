package com.certichain.controller;

import com.certichain.dto.DashboardStats;
import com.certichain.model.*;
import com.certichain.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class DashboardController {

    private final CertificateRepository certificateRepository;
    private final InstitutionRepository institutionRepository;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;

    public DashboardController(CertificateRepository certificateRepository,
                               InstitutionRepository institutionRepository,
                               UserRepository userRepository,
                               AuditLogRepository auditLogRepository) {
        this.certificateRepository = certificateRepository;
        this.institutionRepository = institutionRepository;
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<DashboardStats> getStats() {
        DashboardStats stats = new DashboardStats();
        stats.setTotalCertificates(certificateRepository.count());
        stats.setValidCertificates(certificateRepository.countByStatus(CertificateStatus.VALID));
        stats.setRevokedCertificates(certificateRepository.countByStatus(CertificateStatus.REVOKED));
        stats.setTotalInstitutions(institutionRepository.count());
        stats.setPendingInstitutions(institutionRepository.countByStatus(InstitutionStatus.PENDING));
        stats.setApprovedInstitutions(institutionRepository.countByStatus(InstitutionStatus.APPROVED));
        stats.setTotalStudents(userRepository.findByRole(Role.STUDENT).size());
        stats.setTotalVerifications(auditLogRepository.countByAction(AuditAction.VERIFIED));
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/audit/platform")
    public ResponseEntity<List<AuditLog>> getPlatformAuditLog() {
        return ResponseEntity.ok(auditLogRepository.findAllByOrderByTimestampDesc());
    }

    @GetMapping("/audit/{institutionId}")
    public ResponseEntity<List<AuditLog>> getInstitutionAuditLog(@PathVariable Long institutionId) {
        return ResponseEntity.ok(auditLogRepository.findByInstitutionIdOrderByTimestampDesc(institutionId));
    }
}
