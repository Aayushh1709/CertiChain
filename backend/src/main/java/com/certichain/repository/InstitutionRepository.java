package com.certichain.repository;

import com.certichain.model.Institution;
import com.certichain.model.InstitutionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InstitutionRepository extends JpaRepository<Institution, Long> {
    List<Institution> findByStatus(InstitutionStatus status);
    Optional<Institution> findByWalletAddress(String walletAddress);
    Optional<Institution> findByAccreditationId(String accreditationId);
    long countByStatus(InstitutionStatus status);
}
