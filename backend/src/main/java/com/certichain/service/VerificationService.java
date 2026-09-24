package com.certichain.service;

import com.certichain.dto.VerificationResponse;
import com.certichain.model.AuditAction;
import com.certichain.model.AuditLog;
import com.certichain.model.Certificate;
import com.certichain.model.CertificateStatus;
import com.certichain.repository.AuditLogRepository;
import com.certichain.repository.CertificateRepository;
import com.certichain.util.HashUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class VerificationService {

    private final CertificateRepository certificateRepository;
    private final BlockchainService blockchainService;
    private final AuditLogRepository auditLogRepository;

    public VerificationService(CertificateRepository certificateRepository,
                               BlockchainService blockchainService,
                               AuditLogRepository auditLogRepository) {
        this.certificateRepository = certificateRepository;
        this.blockchainService = blockchainService;
        this.auditLogRepository = auditLogRepository;
    }

    /**
     * Verify by Certificate ID.
     */
    public VerificationResponse verifyByCertificateId(String certificateId) {
        Optional<Certificate> certOpt = certificateRepository.findByCertificateUid(certificateId);
        if (certOpt.isEmpty()) {
            return VerificationResponse.invalid("Certificate ID not found. This certificate does not exist in our system.");
        }

        Certificate cert = certOpt.get();
        return buildVerificationResponse(cert);
    }

    /**
     * Verify by file upload - recomputes hash and checks against blockchain.
     */
    public VerificationResponse verifyByFileHash(byte[] fileBytes) {
        String fileHash = HashUtil.sha256(fileBytes);

        // Check if this hash matches any certificate in our database
        Optional<Certificate> certOpt = certificateRepository.findByCertificateHash(fileHash);
        if (certOpt.isPresent()) {
            return buildVerificationResponse(certOpt.get());
        }

        // Check blockchain directly
        Map<String, Object> blockchainResult = blockchainService.verifyCertificate(fileHash);
        if (blockchainResult == null) {
            return VerificationResponse.invalid("Certificate hash not found. This document has not been issued through CertiChain or may have been tampered with.");
        }

        // Found on chain but not in our DB (unusual but possible)
        VerificationResponse response = new VerificationResponse();
        response.setValid(true);
        response.setStatus(blockchainResult.get("status").toString());
        response.setCertificateHash(fileHash);
        response.setTxHash((String) blockchainResult.get("txHash"));
        response.setBlockNumber((Long) blockchainResult.get("blockNumber"));
        response.setIssueTimestamp((LocalDateTime) blockchainResult.get("issueTimestamp"));
        response.setMessage("Certificate verified on blockchain");
        return response;
    }

    /**
     * Verify by certificate hash directly.
     */
    public VerificationResponse verifyByHash(String hash) {
        Optional<Certificate> certOpt = certificateRepository.findByCertificateHash(hash);
        if (certOpt.isPresent()) {
            return buildVerificationResponse(certOpt.get());
        }

        Map<String, Object> blockchainResult = blockchainService.verifyCertificate(hash);
        if (blockchainResult == null) {
            return VerificationResponse.invalid("Certificate hash not found on blockchain.");
        }

        VerificationResponse response = new VerificationResponse();
        response.setStatus(blockchainResult.get("status").toString());
        response.setValid("VALID".equals(blockchainResult.get("status")));
        response.setCertificateHash(hash);
        response.setTxHash((String) blockchainResult.get("txHash"));
        response.setBlockNumber((Long) blockchainResult.get("blockNumber"));
        return response;
    }

    private VerificationResponse buildVerificationResponse(Certificate cert) {
        VerificationResponse response = new VerificationResponse();

        if (cert.getStatus() == CertificateStatus.REVOKED) {
            response.setValid(false);
            response.setStatus("REVOKED");
            response.setRevocationReason(cert.getRevocationReason());
            response.setRevokedAt(cert.getRevokedAt());
            response.setMessage("This certificate has been revoked by the issuing institution.");
        } else {
            response.setValid(true);
            response.setStatus("VALID");
            response.setMessage("Certificate is valid and verified on blockchain.");
        }

        response.setCertificateUid(cert.getCertificateUid());
        response.setStudentName(cert.getStudentName());
        response.setCourseName(cert.getCourseName());
        response.setGrade(cert.getGrade());
        response.setIssueDate(cert.getIssueDate().toString());
        response.setInstitutionName(cert.getInstitution().getName());
        response.setCertificateHash(cert.getCertificateHash());
        response.setTxHash(cert.getTxHash());
        response.setBlockNumber(cert.getBlockNumber());
        response.setIssueTimestamp(cert.getCreatedAt());

        // Log verification
        AuditLog log = new AuditLog(AuditAction.VERIFIED, "public",
                "Certificate " + cert.getCertificateUid() + " verified - " + response.getStatus());
        log.setCertificate(cert);
        log.setInstitution(cert.getInstitution());
        auditLogRepository.save(log);

        return response;
    }
}
