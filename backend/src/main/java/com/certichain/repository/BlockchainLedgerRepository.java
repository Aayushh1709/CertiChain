package com.certichain.repository;

import com.certichain.model.BlockchainLedger;
import com.certichain.model.CertificateStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BlockchainLedgerRepository extends JpaRepository<BlockchainLedger, Long> {
    Optional<BlockchainLedger> findByCertificateHash(String certificateHash);
    boolean existsByCertificateHash(String certificateHash);
    long countByStatus(CertificateStatus status);
}
