package com.certichain.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "blockchain_ledger")
public class BlockchainLedger {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "certificate_hash", nullable = false, unique = true, length = 64)
    private String certificateHash;

    @Column(name = "issuer_address", nullable = false)
    private String issuerAddress;

    @Column(name = "issue_timestamp", nullable = false)
    private LocalDateTime issueTimestamp;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CertificateStatus status = CertificateStatus.VALID;

    @Column(name = "revocation_reason")
    private String revocationReason;

    @Column(name = "revoke_timestamp")
    private LocalDateTime revokeTimestamp;

    @Column(name = "tx_hash", nullable = false, unique = true)
    private String txHash;

    @Column(name = "block_number", nullable = false)
    private Long blockNumber;

    // Constructors
    public BlockchainLedger() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCertificateHash() { return certificateHash; }
    public void setCertificateHash(String certificateHash) { this.certificateHash = certificateHash; }

    public String getIssuerAddress() { return issuerAddress; }
    public void setIssuerAddress(String issuerAddress) { this.issuerAddress = issuerAddress; }

    public LocalDateTime getIssueTimestamp() { return issueTimestamp; }
    public void setIssueTimestamp(LocalDateTime issueTimestamp) { this.issueTimestamp = issueTimestamp; }

    public CertificateStatus getStatus() { return status; }
    public void setStatus(CertificateStatus status) { this.status = status; }

    public String getRevocationReason() { return revocationReason; }
    public void setRevocationReason(String revocationReason) { this.revocationReason = revocationReason; }

    public LocalDateTime getRevokeTimestamp() { return revokeTimestamp; }
    public void setRevokeTimestamp(LocalDateTime revokeTimestamp) { this.revokeTimestamp = revokeTimestamp; }

    public String getTxHash() { return txHash; }
    public void setTxHash(String txHash) { this.txHash = txHash; }

    public Long getBlockNumber() { return blockNumber; }
    public void setBlockNumber(Long blockNumber) { this.blockNumber = blockNumber; }
}
