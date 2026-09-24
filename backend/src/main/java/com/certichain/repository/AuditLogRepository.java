package com.certichain.repository;

import com.certichain.model.AuditLog;
import com.certichain.model.AuditAction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByInstitutionIdOrderByTimestampDesc(Long institutionId);
    List<AuditLog> findByCertificateIdOrderByTimestampDesc(Long certificateId);
    List<AuditLog> findAllByOrderByTimestampDesc();
    List<AuditLog> findByActionOrderByTimestampDesc(AuditAction action);
    long countByAction(AuditAction action);
}
