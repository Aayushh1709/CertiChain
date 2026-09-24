package com.certichain.controller;

import com.certichain.dto.CertificateResponse;
import com.certichain.dto.IssueCertificateRequest;
import com.certichain.dto.RevokeRequest;
import com.certichain.model.User;
import com.certichain.service.CertificateService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/certificates")
public class CertificateController {

    private final CertificateService certificateService;

    public CertificateController(CertificateService certificateService) {
        this.certificateService = certificateService;
    }

    @PostMapping("/issue")
    public ResponseEntity<?> issueCertificate(@Valid @RequestBody IssueCertificateRequest request,
                                               @AuthenticationPrincipal User user) {
        try {
            CertificateResponse response = certificateService.issueCertificate(request, user);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/bulk-issue")
    public ResponseEntity<?> bulkIssueCertificates(@Valid @RequestBody List<IssueCertificateRequest> requests,
                                                    @AuthenticationPrincipal User user) {
        try {
            List<CertificateResponse> responses = certificateService.bulkIssueCertificates(requests, user);
            return ResponseEntity.ok(responses);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/revoke")
    public ResponseEntity<?> revokeCertificate(@PathVariable Long id,
                                                @Valid @RequestBody RevokeRequest request,
                                                @AuthenticationPrincipal User user) {
        try {
            CertificateResponse response = certificateService.revokeCertificate(id, request.getReason(), user);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/mine")
    public ResponseEntity<List<CertificateResponse>> getMyCertificates(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(certificateService.getStudentCertificates(user.getId()));
    }

    @GetMapping("/institution")
    public ResponseEntity<List<CertificateResponse>> getInstitutionCertificates(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(certificateService.getInstitutionCertificates(user.getInstitution().getId()));
    }

    @GetMapping("/students")
    public ResponseEntity<?> getStudents(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(certificateService.getStudentsForInstitution(user.getInstitution().getId()));
    }

    @GetMapping("/download/{uid}")
    public ResponseEntity<byte[]> downloadCertificate(@PathVariable String uid) {
        try {
            byte[] pdfBytes = certificateService.downloadCertificatePdf(uid);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + uid + ".pdf\"")
                    .body(pdfBytes);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{uid}")
    public ResponseEntity<?> getCertificateByUid(@PathVariable String uid) {
        try {
            return ResponseEntity.ok(certificateService.getCertificateByUid(uid));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
