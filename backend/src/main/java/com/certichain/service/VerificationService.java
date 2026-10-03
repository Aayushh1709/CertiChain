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
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class VerificationService {

    private final CertificateRepository certificateRepository;
    private final BlockchainService blockchainService;
    private final CryptoService cryptoService;
    private final AuditLogRepository auditLogRepository;

    public VerificationService(CertificateRepository certificateRepository,
                               BlockchainService blockchainService,
                               CryptoService cryptoService,
                               AuditLogRepository auditLogRepository) {
        this.certificateRepository = certificateRepository;
        this.blockchainService = blockchainService;
        this.cryptoService = cryptoService;
        this.auditLogRepository = auditLogRepository;
    }

    /**
     * Verify by Certificate ID.
     */
    public VerificationResponse verifyByCertificateId(String certificateId) {
        Optional<Certificate> certOpt = certificateRepository.findByCertificateUid(certificateId);
        if (certOpt.isEmpty()) {
            // Also check by APAAR ID
            List<Certificate> apaarCerts = certificateRepository.findByApaarId(certificateId);
            if (!apaarCerts.isEmpty()) {
                return buildVerificationResponse(apaarCerts.get(0));
            }
            return VerificationResponse.invalid("Certificate ID or APAAR ID not found. No record exists in our system.");
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
        response.setMessage("Certificate verified on blockchain (signature not available for chain-only records)");
        response.setSignatureValid(false); // Can't verify without stored signature
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
        response.setSignatureValid(false);
        return response;
    }

    private VerificationResponse buildVerificationResponse(Certificate cert) {
        VerificationResponse response = new VerificationResponse();

        // ─── Step 1: Check revocation status ─────────────────────────────
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

        // ─── Step 2: Verify digital signature (RSA) ────────────────────
        if (cert.getDigitalSignature() != null && !cert.getDigitalSignature().isEmpty()) {
            boolean sigValid = cryptoService.verify(cert.getCertificateHash(), cert.getDigitalSignature());
            response.setSignatureValid(sigValid);
            response.setDigitalSignature(cert.getDigitalSignature());

            if (!sigValid) {
                response.setValid(false);
                response.setStatus("TAMPERED");
                response.setMessage("⚠ SIGNATURE VERIFICATION FAILED. The certificate data may have been tampered with.");
            } else if (response.isValid()) {
                response.setMessage("Certificate is valid — digital signature verified ✓ and blockchain record confirmed ✓");
            }
        } else {
            response.setSignatureValid(false);
            // Legacy certs without signature — still valid based on hash
        }

        // ─── Step 3: Populate certificate details ──────────────────────
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
        response.setApaarId(cert.getApaarId() != null ? cert.getApaarId() : (cert.getStudent() != null ? cert.getStudent().getApaarId() : null));
        response.setDigilockerId(cert.getStudent() != null ? cert.getStudent().getDigilockerId() : null);

        // ─── Step 4: Audit log ─────────────────────────────────────────
        AuditLog log = new AuditLog(AuditAction.VERIFIED, "public",
                "Certificate " + cert.getCertificateUid() + " verified - " + response.getStatus()
                        + " | Signature: " + (response.isSignatureValid() ? "VALID" : "NOT VERIFIED"));
        log.setCertificate(cert);
        log.setInstitution(cert.getInstitution());
        auditLogRepository.save(log);

        return response;
    }
}
