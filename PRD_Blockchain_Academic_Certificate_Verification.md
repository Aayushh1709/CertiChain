# Product Requirements Document (PRD)

## Project: Blockchain-based Academic Certificate Verification System
### Problem Statement Reference: PS-03 — "Blockchain-based Academic Certificate Verification"

**Document Version:** 1.0
**Date:** September 21, 2026
**Status:** Draft — Ready for Build

---

## 1. Executive Summary

Academic certificate fraud (forged degrees, fake marksheets, and tampered transcripts) is a widespread problem that costs employers, universities, and verification agencies significant time and money, and enables unqualified individuals to gain jobs or admissions fraudulently. Manual verification (calling the university, mailing registrar offices) is slow, error-prone, and not scalable.

This project builds a **Blockchain-based Academic Certificate Verification System** that allows:
- **Educational Institutions** to issue tamper-proof digital certificates whose authenticity is anchored on a blockchain.
- **Students** to hold, manage, and share their certificates via a digital wallet/portal.
- **Verifiers** (employers, other universities, government bodies) to instantly verify a certificate's authenticity without contacting the issuing institution.
- **Administrators** to manage institutions, monitor system integrity, and handle revocations.

The core idea: the actual certificate document (PDF/image) and its metadata are stored off-chain (in a database / IPFS), while a **cryptographic hash (fingerprint)** of the certificate — along with issuance and revocation status — is stored **on-chain**. Since blockchain data is immutable and time-stamped, anyone can re-compute the hash of a document and check it against the chain to instantly know: (a) was this exact document ever issued by this institution, and (b) has it since been revoked.

---

## 2. Goals & Objectives

| # | Objective | Success Metric |
|---|-----------|-----------------|
| 1 | Eliminate certificate forgery | 100% of tampered/forged documents fail verification |
| 2 | Instant verification | Verification result returned in < 5 seconds |
| 3 | Decentralized trust | No single point of failure; verification does not depend on calling the issuing institution |
| 4 | Institution onboarding | Institutions can be onboarded and issue certificates within a day |
| 5 | Revocation support | Institutions can revoke a wrongly issued certificate; revocation reflects on-chain within 1 block confirmation |
| 6 | Public verifiability | Anyone (with or without an account) can verify a certificate via document upload or Certificate ID/QR code |
| 7 | Auditability | Every issuance/revocation event is permanently and transparently logged on-chain |

## 3. Non-Goals (Out of Scope for v1)

- Replacing the university's existing Student Information System (SIS) — this system integrates with/sits alongside it.
- Cross-border legal accreditation / equivalence mapping (e.g., WES-style credential evaluation).
- On-chain storage of full PII or documents (privacy/GDPR risk — only hashes go on-chain).
- Mobile native apps (v1 is web-first, responsive).
- Payment/fee collection module.

---

## 4. Stakeholders / User Roles

### 4.1 Super Admin (Platform Owner)
- Onboards/approves new institutions.
- Monitors system-wide analytics, flags anomalies.
- Manages the smart contract's admin functions (e.g., authorizing/revoking issuer wallet addresses).

### 4.2 Institution Admin / Registrar (Issuer)
- Registers the institution (KYC/approval by Super Admin required).
- Adds authorized staff (e.g., Registrar, Controller of Examinations) who can issue certificates.
- Issues certificates (single or bulk via CSV upload).
- Revokes previously issued certificates (e.g., due to error, disciplinary action, fraud detected post-issuance).
- Views issuance history/audit log for their institution.

### 4.3 Student / Certificate Holder
- Views/downloads all certificates issued to them.
- Shares a certificate with a third party via a shareable verification link or downloadable QR-coded PDF.
- Views the on-chain proof (transaction hash, block number, timestamp) for each certificate.

### 4.4 Verifier (Employer / University / Government Body / General Public)
- No login required for basic verification.
- Verifies a certificate by: (a) uploading the certificate file, (b) entering a Certificate ID, or (c) scanning a QR code.
- Sees a clear ✅ Valid / ❌ Invalid / ⚠️ Revoked result with on-chain proof details.
- (Optional, authenticated) Bulk verification for HR departments processing many candidates.

---

## 5. Core Concept & Data Flow

### 5.1 Issuance Flow
1. Institution Admin logs in and fills a certificate issuance form (student name, roll no., course, grade, date of issuance, etc.) or uploads a bulk CSV + certificate template.
2. Backend generates a certificate document (PDF) using the data + institution's letterhead/template.
3. Backend computes a **SHA-256 hash** of the final PDF (or of the canonicalized JSON metadata — decision documented in §8.3).
4. Backend calls the smart contract's `issueCertificate()` function, storing: `certificateHash`, `issuerAddress`, `studentIdHash` (hashed, not raw, for privacy), `issueTimestamp`, `status = VALID`.
5. Blockchain returns a transaction hash + block number → stored in the off-chain DB linked to the certificate record.
6. A unique **Certificate ID** and **QR code** (encoding a verification URL) are generated and embedded into the PDF.
7. Student is notified (email) and can access the certificate from their portal.

### 5.2 Verification Flow
1. Verifier uploads a certificate file OR enters a Certificate ID OR scans the QR code.
2. If a file is uploaded: backend recomputes its hash.
3. Backend queries the smart contract's `verifyCertificate(certificateHash)` (or `getCertificateById()`).
4. Smart contract returns: exists (yes/no), issuer address, timestamp, current status (VALID/REVOKED).
5. Backend cross-checks the issuer address against its list of approved institutions.
6. Result rendered to the verifier: **Valid**, **Invalid (hash mismatch / not found)**, or **Revoked (with revocation reason + date)**.

### 5.3 Revocation Flow
1. Institution Admin selects an issued certificate and submits a revocation with a reason.
2. Backend calls `revokeCertificate(certificateHash, reason)` on the smart contract.
3. Status on-chain changes to `REVOKED`; timestamp and reason logged in an on-chain event (and mirrored off-chain).
4. Any future verification of that certificate immediately shows the revoked status.

---

## 6. Functional Requirements

### 6.1 Authentication & Authorization
- FR-1: Role-based access control (Super Admin, Institution Admin, Institution Staff, Student, Verifier).
- FR-2: JWT-based session auth for the web app; Institution Admins additionally link a blockchain wallet (e.g., MetaMask) used to sign issuance transactions.
- FR-3: Email/OTP-based signup for students; admin-approval-based onboarding for institutions.

### 6.2 Institution Management
- FR-4: Super Admin can approve/reject/suspend institutions.
- FR-5: Approved institutions get an on-chain "authorized issuer" role granted via the smart contract (only addresses with this role can call `issueCertificate`).
- FR-6: Institution profile includes name, official logo, accreditation ID, and authorized signatory details.

### 6.3 Certificate Issuance
- FR-7: Single certificate issuance via web form.
- FR-8: Bulk issuance via CSV upload (with template download and validation/error reporting).
- FR-9: Auto-generated, tamper-evident PDF certificate with embedded QR code and Certificate ID.
- FR-10: On-chain anchoring of certificate hash on issuance.
- FR-11: Issuance dashboard showing pending/completed/failed transactions (with retry on blockchain failure).

### 6.4 Certificate Management (Student)
- FR-12: Students can view/download all their certificates in one dashboard.
- FR-13: Students can generate a shareable, time-bound or permanent verification link per certificate.

### 6.5 Verification
- FR-14: Public verification page — no login required.
- FR-15: Three verification input modes: file upload, Certificate ID, QR scan.
- FR-16: Verification result shows: status, issuing institution, issue date, block number/tx hash, block explorer link.
- FR-17: Authenticated bulk verification (CSV of Certificate IDs) for enterprise verifiers.

### 6.6 Revocation & Audit
- FR-18: Institution Admin can revoke a certificate with a mandatory reason field.
- FR-19: Full on-chain event log (issuance + revocation) queryable by Super Admin and exportable as a report.
- FR-20: Immutable audit trail view per institution and per certificate.

### 6.7 Notifications
- FR-21: Email notifications on issuance, revocation, and successful third-party verification (optional, configurable).

---

## 7. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | Verification response < 5s; issuance transaction confirmation < 30s (network dependent) |
| Scalability | Support 100,000+ certificates and 1,000+ institutions without redesign |
| Security | OWASP Top 10 compliance; smart contract audited/tested (Slither/Mythril static analysis); private keys never stored in plaintext |
| Availability | 99.5% uptime for the web application (blockchain layer inherits underlying network's availability) |
| Privacy | No raw PII (name, DOB, roll number) stored on-chain — only hashes and institution-identifying data |
| Usability | Verification flow usable by a non-technical person in under 3 clicks |
| Interoperability | REST API for institutions to integrate issuance into their existing ERP/SIS |
| Cost | Gas-efficient smart contract design (batch issuance function to amortize gas cost) |
| Compliance | Data retention & right-to-erasure handled off-chain (on-chain data is hash-only, so erasure of off-chain record effectively de-links identity) |

---

## 8. System Architecture

### 8.1 High-Level Architecture

```
┌─────────────────────┐        ┌──────────────────────┐        ┌────────────────────┐
│   Frontend (Web)     │◄──────►│   Backend API (REST)  │◄──────►│   PostgreSQL DB     │
│  React + Tailwind    │        │  Node.js/Express      │        │  (off-chain metadata│
│  Roles: Admin/Inst/  │        │  + ethers.js          │        │   & documents index)│
│  Student/Verifier    │        └──────────┬────────────┘        └────────────────────┘
└─────────────────────┘                   │
                                            │
                     ┌──────────────────────┼───────────────────────┐
                     ▼                      ▼                       ▼
           ┌──────────────────┐  ┌───────────────────┐   ┌────────────────────┐
           │  Blockchain Layer │  │  File Storage      │   │  PDF/QR Generation  │
           │  Smart Contract   │  │  (IPFS / S3 for    │   │  Service            │
           │  (Solidity, on    │  │   certificate PDFs)│   │  (pdf-lib / puppeteer)│
           │   Polygon/Ethereum│  └───────────────────┘   └────────────────────┘
           │   testnet)        │
           └──────────────────┘
```

### 8.2 Technology Stack (Recommended)

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript, TailwindCSS, shadcn/ui, ethers.js (wallet connect), react-qr-code |
| Backend | Node.js + Express (or NestJS), TypeScript |
| Database | PostgreSQL (off-chain metadata), Prisma ORM |
| File Storage | IPFS (via Pinata/Web3.Storage) for certificate PDFs, or AWS S3 as a simpler alternative |
| Blockchain | Solidity smart contract deployed on **Polygon Mumbai/Amoy testnet** (low gas, EVM-compatible) — can migrate to mainnet later |
| Smart Contract Dev | Hardhat (compile/test/deploy), OpenZeppelin (AccessControl, Pausable) |
| Auth | JWT + bcrypt; wallet-based signing for issuance |
| PDF Generation | pdf-lib or Puppeteer (HTML→PDF) |
| QR Codes | qrcode (npm) |
| Hosting | Frontend: Vercel; Backend: Render/Railway; DB: Supabase/Neon |
| Hashing | keccak256 (Solidity-native) or SHA-256, applied consistently front-to-back |

### 8.3 Design Decision: What Gets Hashed & Stored On-Chain

- **On-chain (Smart Contract Storage):**
  - `certificateHash` (bytes32) — hash of canonicalized certificate metadata JSON (not the PDF binary, since PDF re-generation can alter bytes; hashing structured data is more robust). Document: `{studentIdHash, courseName, institutionId, grade, issueDate, certificateId}` → canonical JSON → keccak256.
  - `issuerAddress` (address)
  - `issueTimestamp` (uint256)
  - `status` (enum: VALID, REVOKED)
  - `revocationReason` (string, only set if revoked)
- **Off-chain (PostgreSQL + IPFS):**
  - Full certificate metadata (student name, DOB, marks, etc.)
  - Generated PDF file (stored in IPFS/S3; only the IPFS CID or S3 URL stored in DB)
  - User accounts, institution profiles, audit logs mirror

This hybrid design keeps gas costs low and avoids putting PII on an immutable public ledger.

---

## 9. Smart Contract Design (Solidity — High Level Spec)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract CertificateRegistry is AccessControl, Pausable {
    bytes32 public constant SUPER_ADMIN_ROLE = keccak256("SUPER_ADMIN_ROLE");
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");

    enum Status { NONE, VALID, REVOKED }

    struct Certificate {
        address issuer;
        uint256 issueTimestamp;
        uint256 revokeTimestamp;
        Status status;
        string revocationReason;
    }

    mapping(bytes32 => Certificate) public certificates; // certificateHash => Certificate

    event CertificateIssued(bytes32 indexed certificateHash, address indexed issuer, uint256 timestamp);
    event CertificateRevoked(bytes32 indexed certificateHash, address indexed issuer, string reason, uint256 timestamp);
    event IssuerAuthorized(address indexed issuer);
    event IssuerRevoked(address indexed issuer);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(SUPER_ADMIN_ROLE, msg.sender);
    }

    function authorizeIssuer(address institution) external onlyRole(SUPER_ADMIN_ROLE) {
        grantRole(ISSUER_ROLE, institution);
        emit IssuerAuthorized(institution);
    }

    function revokeIssuerAccess(address institution) external onlyRole(SUPER_ADMIN_ROLE) {
        revokeRole(ISSUER_ROLE, institution);
        emit IssuerRevoked(institution);
    }

    function issueCertificate(bytes32 certificateHash) external onlyRole(ISSUER_ROLE) whenNotPaused {
        require(certificates[certificateHash].status == Status.NONE, "Already issued");
        certificates[certificateHash] = Certificate({
            issuer: msg.sender,
            issueTimestamp: block.timestamp,
            revokeTimestamp: 0,
            status: Status.VALID,
            revocationReason: ""
        });
        emit CertificateIssued(certificateHash, msg.sender, block.timestamp);
    }

    function batchIssueCertificates(bytes32[] calldata hashes) external onlyRole(ISSUER_ROLE) whenNotPaused {
        for (uint256 i = 0; i < hashes.length; i++) {
            if (certificates[hashes[i]].status == Status.NONE) {
                certificates[hashes[i]] = Certificate(msg.sender, block.timestamp, 0, Status.VALID, "");
                emit CertificateIssued(hashes[i], msg.sender, block.timestamp);
            }
        }
    }

    function revokeCertificate(bytes32 certificateHash, string calldata reason) external onlyRole(ISSUER_ROLE) {
        Certificate storage cert = certificates[certificateHash];
        require(cert.status == Status.VALID, "Not a valid certificate");
        require(cert.issuer == msg.sender, "Only original issuer can revoke");
        cert.status = Status.REVOKED;
        cert.revokeTimestamp = block.timestamp;
        cert.revocationReason = reason;
        emit CertificateRevoked(certificateHash, msg.sender, reason, block.timestamp);
    }

    function verifyCertificate(bytes32 certificateHash) external view returns (
        bool exists, address issuer, uint256 issueTimestamp, Status status, string memory revocationReason
    ) {
        Certificate memory cert = certificates[certificateHash];
        exists = cert.status != Status.NONE;
        return (exists, cert.issuer, cert.issueTimestamp, cert.status, cert.revocationReason);
    }
}
```

**Key design choices:**
- `AccessControl` from OpenZeppelin handles role-based permissions (Super Admin grants Issuer role to approved institutions).
- `batchIssueCertificates` amortizes gas cost for bulk issuance.
- Only the original issuer can revoke their own certificates (prevents cross-institution tampering).
- `Pausable` allows emergency-stopping issuance if a vulnerability is found.

---

## 10. Data Models (Off-Chain PostgreSQL Schema — Simplified)

```
Institution
- id (PK), name, accreditation_id, wallet_address, logo_url, status (pending/approved/suspended), created_at

User
- id (PK), email, password_hash, role (super_admin/institution_admin/student), institution_id (FK, nullable), created_at

Certificate
- id (PK), certificate_uid (public-facing ID), institution_id (FK), student_id (FK),
  student_name, course_name, grade, issue_date,
  certificate_hash (bytes32, indexed), pdf_url (IPFS CID / S3 URL),
  tx_hash, block_number, status (valid/revoked), revocation_reason, revoked_at,
  created_at

AuditLog
- id (PK), certificate_id (FK), action (issued/revoked/verified), performed_by, tx_hash, timestamp
```

---

## 11. Key API Endpoints (REST)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/signup` | Register student/institution | Public |
| POST | `/api/auth/login` | Login | Public |
| POST | `/api/institutions/apply` | Institution applies for onboarding | Public |
| PATCH | `/api/admin/institutions/:id/approve` | Approve institution + grant on-chain issuer role | Super Admin |
| POST | `/api/certificates/issue` | Issue a single certificate | Institution Admin |
| POST | `/api/certificates/bulk-issue` | Bulk issue via CSV | Institution Admin |
| POST | `/api/certificates/:id/revoke` | Revoke a certificate | Institution Admin |
| GET | `/api/certificates/mine` | List my certificates | Student |
| GET | `/api/verify?certificateId=` | Verify by ID | Public |
| POST | `/api/verify/upload` | Verify by file upload (hash recompute) | Public |
| POST | `/api/verify/bulk` | Bulk verify (CSV of IDs) | Verifier (auth) |
| GET | `/api/audit/:institutionId` | Audit log for institution | Super Admin / Institution Admin |

---

## 12. UI / Screens (v1 Scope)

1. **Landing Page** — explains the platform, "Verify a Certificate" CTA front and center.
2. **Public Verification Page** — upload file / enter ID / scan QR → result card (Valid/Invalid/Revoked) with on-chain proof.
3. **Login / Signup** (role-aware).
4. **Institution Onboarding Form** (for new institutions to apply).
5. **Super Admin Dashboard** — pending institution approvals, platform-wide stats, audit log explorer.
6. **Institution Admin Dashboard** — issue certificate (single/bulk), issued certificates list, revoke action, institution audit log.
7. **Student Dashboard** — my certificates, download/share, verification link/QR per certificate.
8. **Certificate Detail / Proof Page** — shown after verification: institution, date, tx hash, block explorer link, status badge.

---

## 13. Security Considerations

- Smart contract role-gating ensures only approved institutions can issue/revoke.
- Private keys for institution wallets should ideally be managed via a custodial signing service (backend signs on behalf of the institution using a securely stored key, e.g., AWS KMS) rather than requiring every registrar to manage MetaMask directly — **recommended for v1 UX**; direct wallet-signing (MetaMask) offered as an advanced/optional mode.
- Rate-limiting on public verification endpoints to prevent abuse/DoS.
- Input validation & sanitization on all bulk CSV uploads.
- Certificate hash collision resistance relies on keccak256/SHA-256 — cryptographically sound.
- Regular smart contract static analysis (Slither) before any mainnet deployment.

---

## 14. Milestones / Build Phases

| Phase | Deliverable |
|---|---|
| 1 | Smart contract development + unit tests (Hardhat) + testnet deployment |
| 2 | Backend API + DB schema + blockchain integration (ethers.js) |
| 3 | Institution & Super Admin flows (onboarding, approval, issuer role granting) |
| 4 | Certificate issuance (single + bulk) + PDF/QR generation + IPFS upload |
| 5 | Public verification flow (file upload, ID, QR) |
| 6 | Student dashboard + revocation flow + audit logs |
| 7 | Polish, security review, deployment docs |

---

## 15. Prompt for ANTIGRAVITY (End-to-End Build Prompt)

> Copy the block below exactly as the instruction to give Antigravity to build this project from scratch.

```
You are building a complete, production-quality full-stack web application called
"CertiChain" — a Blockchain-based Academic Certificate Verification System.

CONTEXT / PROBLEM:
Academic certificates (degrees, marksheets) are frequently forged. Build a system where
educational institutions issue tamper-proof certificates whose authenticity is anchored
on a blockchain, and anyone can instantly verify a certificate's authenticity without
contacting the issuing institution.

CORE ARCHITECTURE:
- A hybrid on-chain/off-chain design: the certificate document and full metadata (student
  name, course, grade, etc.) are stored OFF-chain (PostgreSQL + IPFS for the PDF file).
  Only a cryptographic hash of the certificate's canonicalized metadata, the issuer's
  address, a timestamp, and a status flag (VALID/REVOKED) are stored ON-chain. Never put
  raw personally identifiable information on-chain.

TECH STACK TO USE:
- Smart contract: Solidity ^0.8.20, using OpenZeppelin's AccessControl and Pausable,
  developed and tested with Hardhat, deployed to the Polygon Amoy testnet.
- Backend: Node.js + TypeScript + Express, Prisma ORM, PostgreSQL, ethers.js v6 for
  blockchain interaction, JWT for auth, bcrypt for password hashing.
- Frontend: React 18 + TypeScript + TailwindCSS + shadcn/ui components, react-qr-code
  for QR generation/scanning, ethers.js for optional wallet connect (MetaMask).
- File storage: IPFS via Web3.Storage (or Pinata) for generated certificate PDFs; store
  only the returned CID/URL in the database.
- PDF generation: use pdf-lib (or Puppeteer with an HTML template) to generate a
  professional certificate PDF that embeds a QR code linking to the public verification
  page for that certificate.

USER ROLES TO IMPLEMENT:
1. Super Admin — approves/rejects institution applications; on approval, grants the
   institution's wallet address the ISSUER_ROLE on the smart contract; views
   platform-wide audit logs and stats.
2. Institution Admin — registers/applies for the institution account; once approved,
   can issue certificates (single form + bulk CSV upload with a downloadable template
   and validation error reporting), and can revoke previously issued certificates with
   a mandatory reason. Can view their institution's full issuance/revocation audit log.
3. Student — signs up, views all certificates issued to them in a dashboard, can
   download the certificate PDF, and can generate/copy a public shareable verification
   link (or QR) for any of their certificates.
4. Verifier (public, no login required) — can verify a certificate three ways: upload
   the certificate PDF (system recomputes and checks the hash), enter a Certificate ID,
   or scan a QR code. Result must clearly show: VALID / INVALID (not found or hash
   mismatch) / REVOKED (with reason and revocation date), plus on-chain proof details
   (transaction hash, block number, timestamp, link to a block explorer).
   Also implement an authenticated "bulk verify" mode (upload CSV of Certificate IDs)
   for enterprise verifiers such as HR departments.

SMART CONTRACT REQUIREMENTS (write this first, with full Hardhat test coverage):
- A `CertificateRegistry` contract with:
  - `SUPER_ADMIN_ROLE` and `ISSUER_ROLE` via OpenZeppelin AccessControl.
  - `authorizeIssuer(address)` / `revokeIssuerAccess(address)` — Super Admin only.
  - `issueCertificate(bytes32 certificateHash)` — Issuer only; reverts if the hash was
    already issued.
  - `batchIssueCertificates(bytes32[] hashes)` — Issuer only, for gas-efficient bulk
    issuance.
  - `revokeCertificate(bytes32 certificateHash, string reason)` — only the original
    issuing address can revoke its own certificate.
  - `verifyCertificate(bytes32 certificateHash)` — public view function returning
    (exists, issuer, issueTimestamp, status, revocationReason).
  - Emit events for CertificateIssued, CertificateRevoked, IssuerAuthorized,
    IssuerRevoked so the backend can index them.
  - Include `Pausable` so the Super Admin can pause issuance in an emergency.
- Write full unit tests (Hardhat + Chai) covering: successful issuance, duplicate
  issuance rejection, unauthorized issuer rejection, successful revocation,
  revocation-by-non-issuer rejection, and verification of both valid and non-existent
  hashes.
- Deploy with a Hardhat script to the Polygon Amoy testnet and print the deployed
  contract address and ABI location.

BACKEND REQUIREMENTS:
- REST API with the following endpoint groups: /api/auth (signup/login, JWT),
  /api/institutions (apply, list pending, approve/reject — approval must call
  `authorizeIssuer` on-chain via a securely stored backend signing wallet),
  /api/certificates (issue, bulk-issue, revoke, list mine), /api/verify (by ID, by file
  upload with hash recomputation, bulk verify), /api/audit (institution and
  platform-wide audit log, backed by indexed on-chain events plus an off-chain mirror
  table).
- Prisma schema with models: Institution, User, Certificate, AuditLog — matching the
  fields described above (see the PRD's Data Models section for exact fields).
- On certificate issuance: generate the PDF with embedded QR code, upload it to IPFS,
  compute the canonical metadata hash (keccak256 of a deterministic JSON string:
  studentIdHash + courseName + institutionId + grade + issueDate + certificateId), call
  the smart contract, and store all resulting fields (certificate_uid, pdf CID, hash,
  tx hash, block number) in Postgres.
- Rate-limit the public verification endpoints. Validate and sanitize all CSV bulk
  uploads with clear per-row error reporting.
- Use a securely stored backend wallet (loaded from an environment variable / secrets
  manager, never hardcoded) to sign all institution-approval and certificate-issuance
  transactions on behalf of institutions, so registrars do not need to manage their own
  MetaMask wallets in v1. Also support an optional "advanced mode" where an institution
  connects and signs with their own MetaMask wallet directly from the frontend.

FRONTEND REQUIREMENTS:
Build these pages with a clean, professional, trustworthy visual design (avoid generic
Bootstrap defaults — use a refined color palette, good typography, and clear status
badges for Valid/Invalid/Revoked):
1. Landing page with a prominent "Verify a Certificate" call to action.
2. Public verification page (upload / Certificate ID / QR scan input modes) showing a
   clear result card with on-chain proof details.
3. Login/Signup pages, role-aware redirect after login.
4. Institution application/onboarding form.
5. Super Admin dashboard: pending institution approvals list with approve/reject
   actions, platform stats, searchable audit log.
6. Institution Admin dashboard: issue certificate (single form + bulk CSV upload flow
   with template download and validation feedback), list of issued certificates with
   status and a revoke action (modal requiring a reason), institution audit log.
7. Student dashboard: list of my certificates, download PDF, "Share / Get Verification
   Link" action per certificate (shows shareable URL + QR code).
8. Certificate proof/detail page shown after any successful verification: institution
   name and logo, issue date, status badge, transaction hash with a link to the
   relevant block explorer (Polygon Amoy), block number, and timestamp.

NON-FUNCTIONAL REQUIREMENTS:
- Verification results must return in under 5 seconds.
- No raw PII should ever be written to the blockchain — only hashes and institution/
  issuer identifiers.
- Follow OWASP Top 10 practices: parameterized queries (via Prisma), input validation,
  JWT expiry/refresh, rate limiting, secure password hashing (bcrypt).
- Responsive design (mobile and desktop).
- Provide a `.env.example` file listing all required environment variables (database
  URL, JWT secret, blockchain RPC URL, backend signing wallet private key placeholder,
  IPFS/Web3.Storage API key, contract address).

DELIVERABLES:
1. `/contracts` — Solidity contract + Hardhat config + deployment scripts + full test
   suite.
2. `/backend` — Express + TypeScript API + Prisma schema/migrations + PDF/QR generation
   utilities + blockchain integration service.
3. `/frontend` — React + TypeScript + Tailwind app implementing all pages listed above.
4. A root `README.md` explaining setup: installing dependencies, configuring `.env`,
   running database migrations, deploying the smart contract to Polygon Amoy testnet,
   and running the backend and frontend locally.
5. Seed script to create a demo Super Admin account, one demo approved institution, and
   a couple of sample issued certificates so the full flow can be demoed immediately.

Build this end-to-end, starting with the smart contract and its tests, then the
backend, then the frontend, wiring each layer to the previous one, and finish with the
seed script and README. Prioritize a working, demoable end-to-end flow (issue →
verify → revoke → verify again showing revoked) over exhaustive edge-case polish.
```

---

## 16. Appendix: Glossary

- **On-chain**: Data stored directly on the blockchain ledger, immutable and publicly readable.
- **Off-chain**: Data stored in a traditional database/file storage, referenced by on-chain records.
- **Hash**: A fixed-size cryptographic fingerprint of data (e.g., keccak256, SHA-256); even a 1-byte change in input produces a completely different hash.
- **IPFS**: InterPlanetary File System — a decentralized file storage network, used here to store certificate PDFs off-chain but content-addressably.
- **Smart Contract**: Self-executing code deployed on a blockchain that enforces the issuance/verification/revocation logic.
- **Testnet (Polygon Amoy)**: A free, production-like blockchain network used for development/testing before deploying to Polygon mainnet (which uses real money for gas).
