package com.certichain.repository;

import com.certichain.model.Certificate;
import com.certichain.model.CertificateStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CertificateRepository extends JpaRepository<Certificate, Long> {
    Optional<Certificate> findByCertificateUid(String certificateUid);
    Optional<Certificate> findByCertificateHash(String certificateHash);
    List<Certificate> findByStudentId(Long studentId);
    List<Certificate> findByInstitutionId(Long institutionId);
    List<Certificate> findByInstitutionIdAndStatus(Long institutionId, CertificateStatus status);
    long countByStatus(CertificateStatus status);
    long countByInstitutionId(Long institutionId);
    boolean existsByCertificateHash(String certificateHash);
}
