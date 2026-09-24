package com.certichain.controller;

import com.certichain.dto.VerificationResponse;
import com.certichain.service.VerificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/verify")
public class VerificationController {

    private final VerificationService verificationService;

    public VerificationController(VerificationService verificationService) {
        this.verificationService = verificationService;
    }

    /**
     * Verify by Certificate ID (query param).
     */
    @GetMapping
    public ResponseEntity<VerificationResponse> verifyById(@RequestParam String certificateId) {
        VerificationResponse response = verificationService.verifyByCertificateId(certificateId);
        return ResponseEntity.ok(response);
    }

    /**
     * Verify by file upload.
     */
    @PostMapping("/upload")
    public ResponseEntity<?> verifyByUpload(@RequestParam("file") MultipartFile file) {
        try {
            byte[] bytes = file.getBytes();
            VerificationResponse response = verificationService.verifyByFileHash(bytes);
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to read uploaded file"));
        }
    }

    /**
     * Verify by hash directly.
     */
    @GetMapping("/hash")
    public ResponseEntity<VerificationResponse> verifyByHash(@RequestParam String hash) {
        VerificationResponse response = verificationService.verifyByHash(hash);
        return ResponseEntity.ok(response);
    }

    /**
     * Bulk verification via list of Certificate IDs.
     */
    @PostMapping("/bulk")
    public ResponseEntity<List<VerificationResponse>> bulkVerify(@RequestBody List<String> certificateIds) {
        List<VerificationResponse> results = new ArrayList<>();
        for (String id : certificateIds) {
            results.add(verificationService.verifyByCertificateId(id));
        }
        return ResponseEntity.ok(results);
    }
}
