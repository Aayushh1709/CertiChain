package com.certichain.config;

import com.certichain.model.*;
import com.certichain.repository.*;
import com.certichain.service.BlockchainService;
import com.certichain.util.HashUtil;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

/**
 * Seeds the database with demo data on first run.
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final InstitutionRepository institutionRepository;
    private final CertificateRepository certificateRepository;
    private final AuditLogRepository auditLogRepository;
    private final BlockchainService blockchainService;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, InstitutionRepository institutionRepository,
                      CertificateRepository certificateRepository, AuditLogRepository auditLogRepository,
                      BlockchainService blockchainService, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.institutionRepository = institutionRepository;
        this.certificateRepository = certificateRepository;
        this.auditLogRepository = auditLogRepository;
        this.blockchainService = blockchainService;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return; // Already seeded
        }

        System.out.println("🌱 Seeding demo data...");

        // 1. Create Super Admin
        User superAdmin = new User();
        superAdmin.setEmail("admin@certichain.com");
        superAdmin.setPasswordHash(passwordEncoder.encode("admin123"));
        superAdmin.setFullName("Platform Administrator");
        superAdmin.setRole(Role.SUPER_ADMIN);
        superAdmin = userRepository.save(superAdmin);

        // 2. Create approved institution - IIT Delhi
        Institution iitDelhi = new Institution();
        iitDelhi.setName("Indian Institute of Technology, Delhi");
        iitDelhi.setAccreditationId("AICTE-2024-IIT-001");
        iitDelhi.setWalletAddress("0x" + (UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().replace("-", "")).substring(0, 40));
        iitDelhi.setContactEmail("registrar@iitd.ac.in");
        iitDelhi.setContactPhone("+91-11-26591999");
        iitDelhi.setAddress("Hauz Khas, New Delhi - 110016");
        iitDelhi.setWebsite("https://home.iitd.ac.in");
        iitDelhi.setDescription("Premier engineering institution established in 1961");
        iitDelhi.setStatus(InstitutionStatus.APPROVED);
        iitDelhi = institutionRepository.save(iitDelhi);
        blockchainService.authorizeIssuer(iitDelhi.getWalletAddress());

        // 3. Create pending institution - VIT Vellore
        Institution vitVellore = new Institution();
        vitVellore.setName("Vellore Institute of Technology");
        vitVellore.setAccreditationId("AICTE-2024-VIT-045");
        vitVellore.setWalletAddress("0x" + (UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().replace("-", "")).substring(0, 40));
        vitVellore.setContactEmail("registrar@vit.ac.in");
        vitVellore.setContactPhone("+91-416-2202157");
        vitVellore.setAddress("Vellore, Tamil Nadu - 632014");
        vitVellore.setWebsite("https://vit.ac.in");
        vitVellore.setDescription("Leading multi-campus university known for engineering and technology");
        vitVellore.setStatus(InstitutionStatus.PENDING);
        vitVellore = institutionRepository.save(vitVellore);

        // 4. Create Institution Admin for IIT Delhi
        User instAdmin = new User();
        instAdmin.setEmail("registrar@iitd.ac.in");
        instAdmin.setPasswordHash(passwordEncoder.encode("inst123"));
        instAdmin.setFullName("Dr. Rajesh Kumar");
        instAdmin.setRole(Role.INSTITUTION_ADMIN);
        instAdmin.setInstitution(iitDelhi);
        instAdmin = userRepository.save(instAdmin);

        // 5. Create Institution Admin for VIT (pending)
        User vitAdmin = new User();
        vitAdmin.setEmail("registrar@vit.ac.in");
        vitAdmin.setPasswordHash(passwordEncoder.encode("inst123"));
        vitAdmin.setFullName("Dr. Anand Sharma");
        vitAdmin.setRole(Role.INSTITUTION_ADMIN);
        vitAdmin.setInstitution(vitVellore);
        vitAdmin = userRepository.save(vitAdmin);

        // 6. Create Students
        User student1 = new User();
        student1.setEmail("ayush@student.com");
        student1.setPasswordHash(passwordEncoder.encode("student123"));
        student1.setFullName("Ayush Mishra");
        student1.setRole(Role.STUDENT);
        student1 = userRepository.save(student1);

        User student2 = new User();
        student2.setEmail("priya@student.com");
        student2.setPasswordHash(passwordEncoder.encode("student123"));
        student2.setFullName("Priya Patel");
        student2.setRole(Role.STUDENT);
        student2 = userRepository.save(student2);

        // 7. Issue sample certificates
        issueSampleCertificate(student1, iitDelhi, "B.Tech Computer Science and Engineering",
                "A+", "CC-DEMO0001", LocalDate.of(2026, 6, 15));
        issueSampleCertificate(student1, iitDelhi, "M.Tech Artificial Intelligence",
                "A", "CC-DEMO0002", LocalDate.of(2026, 8, 20));
        issueSampleCertificate(student2, iitDelhi, "B.Tech Electronics and Communication",
                "A+", "CC-DEMO0003", LocalDate.of(2026, 6, 15));

        // 8. Audit logs for institution approval
        AuditLog approvalLog = new AuditLog(AuditAction.INSTITUTION_APPROVED, "admin@certichain.com",
                "Institution 'IIT Delhi' approved and authorized as issuer");
        approvalLog.setInstitution(iitDelhi);
        auditLogRepository.save(approvalLog);

        System.out.println("✅ Demo data seeded successfully!");
        System.out.println("   Super Admin: admin@certichain.com / admin123");
        System.out.println("   Institution Admin (IIT Delhi): registrar@iitd.ac.in / inst123");
        System.out.println("   Student 1: ayush@student.com / student123");
        System.out.println("   Student 2: priya@student.com / student123");
    }

    private void issueSampleCertificate(User student, Institution institution,
                                         String courseName, String grade,
                                         String certUid, LocalDate issueDate) {
        String certificateHash = HashUtil.computeCertificateHash(
                student.getId(), courseName, institution.getId(),
                grade, issueDate.toString(), certUid
        );

        // Record on simulated blockchain
        Map<String, Object> bcResult = blockchainService.issueCertificate(
                certificateHash, institution.getWalletAddress());

        // Create certificate record
        Certificate cert = new Certificate();
        cert.setCertificateUid(certUid);
        cert.setInstitution(institution);
        cert.setStudent(student);
        cert.setStudentName(student.getFullName());
        cert.setStudentRollNo("2022" + student.getId() + "001");
        cert.setCourseName(courseName);
        cert.setGrade(grade);
        cert.setIssueDate(issueDate);
        cert.setCertificateHash(certificateHash);
        cert.setPdfPath("./data/certificates/" + certUid + ".pdf");
        cert.setTxHash((String) bcResult.get("txHash"));
        cert.setBlockNumber((Long) bcResult.get("blockNumber"));
        cert.setStatus(CertificateStatus.VALID);
        cert = certificateRepository.save(cert);

        // Audit log
        AuditLog log = new AuditLog(AuditAction.ISSUED, "registrar@iitd.ac.in",
                "Certificate " + certUid + " issued to " + student.getFullName());
        log.setCertificate(cert);
        log.setInstitution(institution);
        log.setTxHash(cert.getTxHash());
        auditLogRepository.save(log);
    }
}
