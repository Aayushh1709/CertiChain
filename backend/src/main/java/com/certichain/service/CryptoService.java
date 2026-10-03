package com.certichain.service;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.*;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

/**
 * Cryptographic signing and verification service using RSA-2048 with SHA-256.
 *
 * <p>This service manages an RSA key pair that is used to:
 * <ol>
 *   <li><b>Sign</b> certificate hashes at issuance time (proves authenticity & non-repudiation).</li>
 *   <li><b>Verify</b> signatures during certificate verification (proves data integrity).</li>
 * </ol>
 *
 * <p>The key pair is persisted to disk so that it survives application restarts.
 * In production, replace file-based storage with a Hardware Security Module (HSM)
 * or a cloud key vault (e.g. AWS KMS, Azure Key Vault).
 *
 * <p><b>Algorithm:</b> SHA256withRSA (RSA-2048 key)
 */
@Service
public class CryptoService {

    private static final String ALGORITHM = "RSA";
    private static final String SIGNATURE_ALGORITHM = "SHA256withRSA";
    private static final int KEY_SIZE = 2048;

    @Value("${certichain.crypto.key-path:./data/keys}")
    private String keyPath;

    private PrivateKey privateKey;
    private PublicKey publicKey;

    /**
     * On application startup, loads or generates the RSA key pair.
     */
    @PostConstruct
    public void init() {
        try {
            Path keyDir = Paths.get(keyPath);
            Files.createDirectories(keyDir);

            Path privateKeyFile = keyDir.resolve("private.key");
            Path publicKeyFile = keyDir.resolve("public.key");

            if (Files.exists(privateKeyFile) && Files.exists(publicKeyFile)) {
                loadKeyPair(privateKeyFile, publicKeyFile);
                System.out.println("🔑 Loaded existing RSA key pair from: " + keyDir.toAbsolutePath());
            } else {
                generateAndSaveKeyPair(privateKeyFile, publicKeyFile);
                System.out.println("🔐 Generated new RSA-2048 key pair at: " + keyDir.toAbsolutePath());
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to initialize cryptographic keys", e);
        }
    }

    /**
     * Digitally signs data using the platform's RSA private key.
     *
     * @param data the plaintext data to sign (typically the certificate hash)
     * @return Base64-encoded RSA signature
     */
    public String sign(String data) {
        try {
            Signature signer = Signature.getInstance(SIGNATURE_ALGORITHM);
            signer.initSign(privateKey);
            signer.update(data.getBytes(StandardCharsets.UTF_8));
            byte[] signatureBytes = signer.sign();
            return Base64.getEncoder().encodeToString(signatureBytes);
        } catch (NoSuchAlgorithmException | InvalidKeyException | SignatureException e) {
            throw new RuntimeException("Failed to sign data", e);
        }
    }

    /**
     * Verifies a digital signature against the original data using the platform's RSA public key.
     *
     * @param data           the original plaintext data
     * @param signatureBase64 the Base64-encoded signature to verify
     * @return true if the signature is valid, false otherwise
     */
    public boolean verify(String data, String signatureBase64) {
        try {
            Signature verifier = Signature.getInstance(SIGNATURE_ALGORITHM);
            verifier.initVerify(publicKey);
            verifier.update(data.getBytes(StandardCharsets.UTF_8));
            byte[] signatureBytes = Base64.getDecoder().decode(signatureBase64);
            return verifier.verify(signatureBytes);
        } catch (NoSuchAlgorithmException | InvalidKeyException | SignatureException e) {
            throw new RuntimeException("Failed to verify signature", e);
        } catch (IllegalArgumentException e) {
            // Invalid Base64
            return false;
        }
    }

    /**
     * Returns the platform's public key as a Base64-encoded string.
     * This can be shared publicly so that anyone can verify certificate signatures.
     */
    public String getPublicKeyBase64() {
        return Base64.getEncoder().encodeToString(publicKey.getEncoded());
    }

    /**
     * Returns the public key in PEM format (for display / download).
     */
    public String getPublicKeyPem() {
        String base64 = getPublicKeyBase64();
        StringBuilder pem = new StringBuilder();
        pem.append("-----BEGIN PUBLIC KEY-----\n");
        // Split into 64-character lines per PEM standard
        for (int i = 0; i < base64.length(); i += 64) {
            pem.append(base64, i, Math.min(i + 64, base64.length()));
            pem.append("\n");
        }
        pem.append("-----END PUBLIC KEY-----\n");
        return pem.toString();
    }

    // ─── Private Helpers ─────────────────────────────────────────────

    private void generateAndSaveKeyPair(Path privateKeyFile, Path publicKeyFile)
            throws NoSuchAlgorithmException, IOException {
        KeyPairGenerator generator = KeyPairGenerator.getInstance(ALGORITHM);
        generator.initialize(KEY_SIZE, new SecureRandom());
        KeyPair keyPair = generator.generateKeyPair();

        this.privateKey = keyPair.getPrivate();
        this.publicKey = keyPair.getPublic();

        // Persist keys so they survive restarts
        Files.write(privateKeyFile, privateKey.getEncoded());
        Files.write(publicKeyFile, publicKey.getEncoded());
    }

    private void loadKeyPair(Path privateKeyFile, Path publicKeyFile) throws Exception {
        byte[] privateKeyBytes = Files.readAllBytes(privateKeyFile);
        byte[] publicKeyBytes = Files.readAllBytes(publicKeyFile);

        KeyFactory keyFactory = KeyFactory.getInstance(ALGORITHM);
        this.privateKey = keyFactory.generatePrivate(new PKCS8EncodedKeySpec(privateKeyBytes));
        this.publicKey = keyFactory.generatePublic(new X509EncodedKeySpec(publicKeyBytes));
    }
}
