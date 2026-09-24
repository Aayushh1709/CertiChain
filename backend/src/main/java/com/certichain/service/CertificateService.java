package com.certichain.service;

import com.certichain.dto.CertificateResponse;
import com.certichain.dto.IssueCertificateRequest;
import com.certichain.model.*;
import com.certichain.repository.AuditLogRepository;
import com.certichain.repository.CertificateRepository;
import com.certichain.repository.UserRepository;
import com.certichain.util.HashUtil;
import com.certichain.util.PdfGenerator;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@Transactional
public class CertificateService {

    private final CertificateRepository certificateRepository;
    private final UserRepository userRepository;
    private final BlockchainService blockchainService;
    private final AuditLogRepository auditLogRepository;
    private final PdfGenerator pdfGenerator;

    @Value("${certichain.certificates.storage-path}")
    private String storagePath;

    @Value("${certichain.base-url}")
    private String baseUrl;

    public CertificateService(CertificateRepository certificateRepository,
                              UserRepository userRepository,
                              BlockchainService blockchainService,
                              AuditLogRepository auditLogRepository,
                              PdfGenerator pdfGenerator) {
        this.certificateRepository = certificateRepository;
        this.userRepository = userRepository;
        this.blockchainService = blockchainService;
        this.auditLogRepository = auditLogRepository;
        this.pdfGenerator = pdfGenerator;
    }

    @Transactional
    public CertificateResponse issueCertificate(IssueCertificateRequest request, User issuer) {
        Institution institution = issuer.getInstitution();
        if (institution == null || institution.getStatus() != InstitutionStatus.APPROVED) {
            throw new RuntimeException("Your institution is not approved for certificate issuance");
        }

        User student = userRepository.findById(request.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (student.getRole() != Role.STUDENT) {
            throw new RuntimeException("Target user is not a student");
        }

        // Generate unique certificate ID
        String certificateUid = "CC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        // Compute certificate hash
        String certificateHash = HashUtil.computeCertificateHash(
                student.getId(), request.getCourseName(),
                institution.getId(), request.getGrade(),
                request.getIssueDate(), certificateUid
        );

        // Issue on simulated blockchain
        Map<String, Object> blockchainResult = blockchainService.issueCertificate(
                certificateHash, institution.getWalletAddress());

        // Generate PDF
        LocalDate issueDate = LocalDate.parse(request.getIssueDate());
        byte[] pdfBytes = pdfGenerator.generateCertificatePdf(
                certificateUid, request.getStudentName(), request.getCourseName(),
                request.getGrade(), institution.getName(), issueDate, certificateHash
        );

        // Save PDF to filesystem
        String pdfPath = savePdf(certificateUid, pdfBytes);

        // Create certificate record
        Certificate cert = new Certificate();
        cert.setCertificateUid(certificateUid);
        cert.setInstitution(institution);
        cert.setStudent(student);
        cert.setStudentName(request.getStudentName());
        cert.setStudentRollNo(request.getStudentRollNo());
        cert.setCourseName(request.getCourseName());
        cert.setGrade(request.getGrade());
        cert.setIssueDate(issueDate);
        cert.setCertificateHash(certificateHash);
        cert.setPdfPath(pdfPath);
        cert.setTxHash((String) blockchainResult.get("txHash"));
        cert.setBlockNumber((Long) blockchainResult.get("blockNumber"));
        cert.setStatus(CertificateStatus.VALID);

        cert = certificateRepository.save(cert);

        // Audit log
        AuditLog log = new AuditLog(AuditAction.ISSUED, issuer.getEmail(),
                "Certificate " + certificateUid + " issued to " + request.getStudentName());
        log.setCertificate(cert);
        log.setInstitution(institution);
        log.setTxHash(cert.getTxHash());
        auditLogRepository.save(log);

        return toResponse(cert);
    }

    @Transactional
    public List<CertificateResponse> bulkIssueCertificates(List<IssueCertificateRequest> requests, User issuer) {
        List<CertificateResponse> responses = new ArrayList<>();
        for (IssueCertificateRequest request : requests) {
            try {
                responses.add(issueCertificate(request, issuer));
            } catch (Exception e) {
                CertificateResponse errorResponse = new CertificateResponse();
                errorResponse.setStudentName(request.getStudentName());
                errorResponse.setStatus("ERROR: " + e.getMessage());
                responses.add(errorResponse);
            }
        }
        return responses;
    }

    @Transactional
    public CertificateResponse revokeCertificate(Long certificateId, String reason, User issuer) {
        Certificate cert = certificateRepository.findById(certificateId)
                .orElseThrow(() -> new RuntimeException("Certificate not found"));

        Institution institution = issuer.getInstitution();
        if (!cert.getInstitution().getId().equals(institution.getId())) {
            throw new RuntimeException("You can only revoke certificates issued by your institution");
        }

        if (cert.getStatus() == CertificateStatus.REVOKED) {
            throw new RuntimeException("Certificate is already revoked");
        }

        // Revoke on blockchain
        blockchainService.revokeCertificate(cert.getCertificateHash(),
                institution.getWalletAddress(), reason);

        cert.setStatus(CertificateStatus.REVOKED);
        cert.setRevocationReason(reason);
        cert.setRevokedAt(LocalDateTime.now());
        cert = certificateRepository.save(cert);

        // Audit log
        AuditLog log = new AuditLog(AuditAction.REVOKED, issuer.getEmail(),
                "Certificate " + cert.getCertificateUid() + " revoked. Reason: " + reason);
        log.setCertificate(cert);
        log.setInstitution(institution);
        log.setTxHash(cert.getTxHash());
        auditLogRepository.save(log);

        return toResponse(cert);
    }

    public List<CertificateResponse> getStudentCertificates(Long studentId) {
        return certificateRepository.findByStudentId(studentId).stream()
                .map(this::toResponse)
                .toList();
    }

    public List<CertificateResponse> getInstitutionCertificates(Long institutionId) {
        return certificateRepository.findByInstitutionId(institutionId).stream()
                .map(this::toResponse)
                .toList();
    }

    public CertificateResponse getCertificateByUid(String uid) {
        Certificate cert = certificateRepository.findByCertificateUid(uid)
                .orElseThrow(() -> new RuntimeException("Certificate not found"));
        return toResponse(cert);
    }

    public byte[] downloadCertificatePdf(String certificateUid) {
        Certificate cert = certificateRepository.findByCertificateUid(certificateUid)
                .orElseThrow(() -> new RuntimeException("Certificate not found"));

        try {
            Path path = Paths.get(cert.getPdfPath());
            if (Files.exists(path)) {
                return Files.readAllBytes(path);
            }
            // Regenerate PDF if file doesn't exist
            return pdfGenerator.generateCertificatePdf(
                    cert.getCertificateUid(), cert.getStudentName(), cert.getCourseName(),
                    cert.getGrade(), cert.getInstitution().getName(), cert.getIssueDate(),
                    cert.getCertificateHash()
            );
        } catch (IOException e) {
            throw new RuntimeException("Failed to read certificate PDF", e);
        }
    }

    public List<User> getStudentsForInstitution(Long institutionId) {
        return userRepository.findByRole(Role.STUDENT);
    }

    private String savePdf(String certificateUid, byte[] pdfBytes) {
        try {
            Path dir = Paths.get(storagePath);
            Files.createDirectories(dir);
            Path filePath = dir.resolve(certificateUid + ".pdf");
            Files.write(filePath, pdfBytes);
            return filePath.toString();
        } catch (IOException e) {
            throw new RuntimeException("Failed to save certificate PDF", e);
        }
    }

    private CertificateResponse toResponse(Certificate cert) {
        CertificateResponse response = new CertificateResponse();
        response.setId(cert.getId());
        response.setCertificateUid(cert.getCertificateUid());
        response.setStudentName(cert.getStudentName());
        response.setStudentRollNo(cert.getStudentRollNo());
        response.setCourseName(cert.getCourseName());
        response.setGrade(cert.getGrade());
        response.setIssueDate(cert.getIssueDate());
        response.setCertificateHash(cert.getCertificateHash());
        response.setTxHash(cert.getTxHash());
        response.setBlockNumber(cert.getBlockNumber());
        response.setStatus(cert.getStatus().name());
        response.setRevocationReason(cert.getRevocationReason());
        response.setRevokedAt(cert.getRevokedAt());
        response.setCreatedAt(cert.getCreatedAt());
        response.setInstitutionName(cert.getInstitution().getName());
        response.setInstitutionId(cert.getInstitution().getId());
        response.setPdfUrl(baseUrl + "/api/certificates/download/" + cert.getCertificateUid());
        response.setVerifyUrl(baseUrl + "/verify?id=" + cert.getCertificateUid());
        return response;
    }
}
