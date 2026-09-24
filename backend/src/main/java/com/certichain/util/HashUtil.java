package com.certichain.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class HashUtil {

    private HashUtil() {}

    /**
     * Computes SHA-256 hash of the canonical certificate metadata.
     * The canonical form is a deterministic JSON string: 
     * {studentIdHash, courseName, institutionId, grade, issueDate, certificateId}
     */
    public static String computeCertificateHash(Long studentId, String courseName,
                                                 Long institutionId, String grade,
                                                 String issueDate, String certificateUid) {
        // Create canonical JSON string (deterministic ordering)
        String canonical = String.format(
            "{\"certificateId\":\"%s\",\"courseName\":\"%s\",\"grade\":\"%s\",\"institutionId\":%d,\"issueDate\":\"%s\",\"studentIdHash\":\"%s\"}",
            certificateUid, courseName, grade, institutionId, issueDate, sha256(String.valueOf(studentId))
        );
        return sha256(canonical);
    }

    /**
     * Computes SHA-256 hash of raw bytes (for file upload verification).
     */
    public static String sha256(byte[] data) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(data);
            return bytesToHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }

    /**
     * Computes SHA-256 hash of a string.
     */
    public static String sha256(String data) {
        return sha256(data.getBytes(StandardCharsets.UTF_8));
    }

    private static String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}
