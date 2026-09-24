package com.certichain.service;

import com.certichain.model.*;
import com.certichain.repository.AuditLogRepository;
import com.certichain.repository.InstitutionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class InstitutionService {

    private final InstitutionRepository institutionRepository;
    private final BlockchainService blockchainService;
    private final AuditLogRepository auditLogRepository;

    public InstitutionService(InstitutionRepository institutionRepository,
                              BlockchainService blockchainService,
                              AuditLogRepository auditLogRepository) {
        this.institutionRepository = institutionRepository;
        this.blockchainService = blockchainService;
        this.auditLogRepository = auditLogRepository;
    }

    public List<Institution> getPendingInstitutions() {
        return institutionRepository.findByStatus(InstitutionStatus.PENDING);
    }

    public List<Institution> getAllInstitutions() {
        return institutionRepository.findAll();
    }

    public Institution getInstitutionById(Long id) {
        return institutionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Institution not found"));
    }

    @Transactional
    public Institution approveInstitution(Long id, String performedBy) {
        Institution institution = getInstitutionById(id);

        if (institution.getStatus() != InstitutionStatus.PENDING) {
            throw new RuntimeException("Institution is not in pending status");
        }

        institution.setStatus(InstitutionStatus.APPROVED);
        institution = institutionRepository.save(institution);

        // Authorize on the simulated blockchain
        blockchainService.authorizeIssuer(institution.getWalletAddress());

        // Audit log
        AuditLog log = new AuditLog(AuditAction.INSTITUTION_APPROVED, performedBy,
                "Institution '" + institution.getName() + "' approved");
        log.setInstitution(institution);
        auditLogRepository.save(log);

        return institution;
    }

    @Transactional
    public Institution rejectInstitution(Long id, String performedBy) {
        Institution institution = getInstitutionById(id);

        if (institution.getStatus() != InstitutionStatus.PENDING) {
            throw new RuntimeException("Institution is not in pending status");
        }

        institution.setStatus(InstitutionStatus.REJECTED);
        institution = institutionRepository.save(institution);

        // Audit log
        AuditLog log = new AuditLog(AuditAction.INSTITUTION_REJECTED, performedBy,
                "Institution '" + institution.getName() + "' rejected");
        log.setInstitution(institution);
        auditLogRepository.save(log);

        return institution;
    }

    @Transactional
    public Institution suspendInstitution(Long id, String performedBy) {
        Institution institution = getInstitutionById(id);

        institution.setStatus(InstitutionStatus.SUSPENDED);
        institution = institutionRepository.save(institution);

        // Revoke on-chain access
        blockchainService.revokeIssuerAccess(institution.getWalletAddress());

        // Audit log
        AuditLog log = new AuditLog(AuditAction.INSTITUTION_SUSPENDED, performedBy,
                "Institution '" + institution.getName() + "' suspended");
        log.setInstitution(institution);
        auditLogRepository.save(log);

        return institution;
    }
}
