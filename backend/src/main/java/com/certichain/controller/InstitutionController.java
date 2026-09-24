package com.certichain.controller;

import com.certichain.model.Institution;
import com.certichain.model.User;
import com.certichain.service.InstitutionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class InstitutionController {

    private final InstitutionService institutionService;

    public InstitutionController(InstitutionService institutionService) {
        this.institutionService = institutionService;
    }

    @GetMapping("/admin/institutions/pending")
    public ResponseEntity<List<Institution>> getPendingInstitutions() {
        return ResponseEntity.ok(institutionService.getPendingInstitutions());
    }

    @GetMapping("/admin/institutions")
    public ResponseEntity<List<Institution>> getAllInstitutions() {
        return ResponseEntity.ok(institutionService.getAllInstitutions());
    }

    @GetMapping("/admin/institutions/{id}")
    public ResponseEntity<?> getInstitution(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(institutionService.getInstitutionById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/admin/institutions/{id}/approve")
    public ResponseEntity<?> approveInstitution(@PathVariable Long id,
                                                 @AuthenticationPrincipal User user) {
        try {
            Institution inst = institutionService.approveInstitution(id, user.getEmail());
            return ResponseEntity.ok(Map.of(
                "message", "Institution approved successfully",
                "institution", inst.getName(),
                "walletAddress", inst.getWalletAddress()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/admin/institutions/{id}/reject")
    public ResponseEntity<?> rejectInstitution(@PathVariable Long id,
                                                @AuthenticationPrincipal User user) {
        try {
            Institution inst = institutionService.rejectInstitution(id, user.getEmail());
            return ResponseEntity.ok(Map.of("message", "Institution rejected", "institution", inst.getName()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/admin/institutions/{id}/suspend")
    public ResponseEntity<?> suspendInstitution(@PathVariable Long id,
                                                 @AuthenticationPrincipal User user) {
        try {
            Institution inst = institutionService.suspendInstitution(id, user.getEmail());
            return ResponseEntity.ok(Map.of("message", "Institution suspended", "institution", inst.getName()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
