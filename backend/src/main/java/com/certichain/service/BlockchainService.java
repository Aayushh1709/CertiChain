package com.certichain.service;

import com.certichain.model.BlockchainLedger;
import com.certichain.model.CertificateStatus;
import com.certichain.repository.BlockchainLedgerRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Simulated Blockchain Service.
 * Mimics smart contract behavior (issue, verify, revoke, authorize issuer)
 * using H2 database as the "ledger" without requiring any actual blockchain.
 */
@Service
public class BlockchainService {

    private final BlockchainLedgerRepository ledgerRepository;
    private final AtomicLong blockCounter = new AtomicLong(1000);
    private final Set<String> authorizedIssuers = Collections.synchronizedSet(new HashSet<>());

    public BlockchainService(BlockchainLedgerRepository ledgerRepository) {
        this.ledgerRepository = ledgerRepository;
        // Initialize with a default platform issuer
        authorizedIssuers.add("0xCERTICHAIN_PLATFORM");
    }

    /**
     * Authorizes an institution's wallet address to issue certificates.
     * Equivalent to smart contract's authorizeIssuer(address).
     */
    public void authorizeIssuer(String walletAddress) {
        authorizedIssuers.add(walletAddress);
    }

    /**
     * Revokes an institution's issuer authorization.
     */
    public void revokeIssuerAccess(String walletAddress) {
        authorizedIssuers.remove(walletAddress);
    }

    /**
     * Checks if an address is an authorized issuer.
     */
    public boolean isAuthorizedIssuer(String walletAddress) {
        return authorizedIssuers.contains(walletAddress);
    }

    /**
     * Issues a certificate on the simulated blockchain.
     * Returns a map with txHash and blockNumber.
     */
    public Map<String, Object> issueCertificate(String certificateHash, String issuerAddress) {
        if (ledgerRepository.existsByCertificateHash(certificateHash)) {
            throw new RuntimeException("Certificate hash already exists on-chain");
        }

        BlockchainLedger entry = new BlockchainLedger();
        entry.setCertificateHash(certificateHash);
        entry.setIssuerAddress(issuerAddress);
        entry.setIssueTimestamp(LocalDateTime.now());
        entry.setStatus(CertificateStatus.VALID);
        entry.setTxHash("0x" + UUID.randomUUID().toString().replace("-", ""));
        entry.setBlockNumber(blockCounter.incrementAndGet());

        ledgerRepository.save(entry);

        Map<String, Object> result = new HashMap<>();
        result.put("txHash", entry.getTxHash());
        result.put("blockNumber", entry.getBlockNumber());
        result.put("timestamp", entry.getIssueTimestamp());
        return result;
    }

    /**
     * Batch issues certificates on the simulated blockchain.
     */
    public List<Map<String, Object>> batchIssueCertificates(List<String> hashes, String issuerAddress) {
        List<Map<String, Object>> results = new ArrayList<>();
        for (String hash : hashes) {
            try {
                results.add(issueCertificate(hash, issuerAddress));
            } catch (RuntimeException e) {
                Map<String, Object> error = new HashMap<>();
                error.put("hash", hash);
                error.put("error", e.getMessage());
                results.add(error);
            }
        }
        return results;
    }

    /**
     * Verifies a certificate on the simulated blockchain.
     * Returns certificate details or null if not found.
     */
    public Map<String, Object> verifyCertificate(String certificateHash) {
        Optional<BlockchainLedger> entry = ledgerRepository.findByCertificateHash(certificateHash);
        if (entry.isEmpty()) {
            return null;
        }

        BlockchainLedger ledger = entry.get();
        Map<String, Object> result = new HashMap<>();
        result.put("exists", true);
        result.put("issuerAddress", ledger.getIssuerAddress());
        result.put("issueTimestamp", ledger.getIssueTimestamp());
        result.put("status", ledger.getStatus().name());
        result.put("txHash", ledger.getTxHash());
        result.put("blockNumber", ledger.getBlockNumber());
        result.put("revocationReason", ledger.getRevocationReason());
        result.put("revokeTimestamp", ledger.getRevokeTimestamp());
        return result;
    }

    /**
     * Revokes a certificate on the simulated blockchain.
     * Only the original issuer can revoke.
     */
    public Map<String, Object> revokeCertificate(String certificateHash, String issuerAddress, String reason) {
        BlockchainLedger entry = ledgerRepository.findByCertificateHash(certificateHash)
                .orElseThrow(() -> new RuntimeException("Certificate not found on-chain"));

        if (!entry.getIssuerAddress().equals(issuerAddress)) {
            throw new RuntimeException("Only the original issuer can revoke this certificate");
        }

        if (entry.getStatus() == CertificateStatus.REVOKED) {
            throw new RuntimeException("Certificate is already revoked");
        }

        entry.setStatus(CertificateStatus.REVOKED);
        entry.setRevocationReason(reason);
        entry.setRevokeTimestamp(LocalDateTime.now());
        ledgerRepository.save(entry);

        Map<String, Object> result = new HashMap<>();
        result.put("txHash", entry.getTxHash());
        result.put("blockNumber", entry.getBlockNumber());
        result.put("revokeTimestamp", entry.getRevokeTimestamp());
        return result;
    }
}
