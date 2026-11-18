# SecureBank — Secure Online Banking System

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.5-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-blue.svg)](https://www.postgresql.org/)
[![Security](https://img.shields.io/badge/OWASP-Top%2010%20Hardened-red.svg)](https://owasp.org/)
[![License](https://img.shields.io/badge/License-Educational%20Use-lightgrey.svg)]()

> **IMPORTANT DISCLAIMER:**  
> This project is an **educational banking simulation**. It does not integrate with real payment gateways, external banking networks, or actual monetary accounts. All financial records and transactions are simulated inside a local database sandbox.

---

## 1. Project Overview

**SecureBank** is an educational, full-stack online banking platform designed to demonstrate modern **proactive web application security**, **financial transaction integrity**, and **defensive software engineering**. 

Rather than treating security as an afterthought or a frontend validation layer, SecureBank enforces strict authorization, double-entry bookkeeping, pessimistic concurrency control, and cryptographic hygiene on the backend.

### Key Capabilities

- **Double-Entry Financial Ledger:** Every transfer is an atomic database transaction that generates balanced debit and credit ledger entries.
- **Race Condition & Double-Spending Prevention:** Pessimistic row locking (`@Lock(LockModeType.PESSIMISTIC_WRITE)`) with deterministic ordering (`Math.min` / `Math.max` ID locking) guarantees deadlock-free atomic balance mutations.
- **Idempotency Protection:** Unique client-supplied idempotency keys guarantee that network retries never debit an account twice.
- **IDOR & Broken Access Control Immunity:** Backend resource ownership checks verify that Customer A cannot access Customer B's accounts, beneficiaries, or transactions.
- **Multi-Factor Authentication (MFA):** TOTP-based 2FA compatible with Google Authenticator, Microsoft Authenticator, and Authy, featuring AES-256-GCM encrypted secrets at rest and hashed backup recovery codes.
- **Brute-Force & Credential Stuffing Defense:** Progressive delays, Bucket4j token-bucket rate limiting, and automatic 15-minute account lockouts after 5 consecutive failures.
- **CSRF & Session Fixation Protection:** Double-submit CSRF cookie pattern with `SameSite=Lax`, server-side session invalidation, and session ID regeneration upon authentication.
- **Rule-Based Fraud & Anomaly Monitoring:** Automated detection of large transfers (≥ ₹50,000), high transfer velocities (> 5 transfers in 10 minutes), brute-force login spikes, and IDOR probes.
- **Live Vulnerability Demonstration Lab:** An interactive in-app security playground allowing evaluators and students to test attack payloads (SQLi, XSS, CSRF, IDOR) directly against the application.

---

## 2. Technology Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Tooling:** Vite 6
- **Styling:** Tailwind CSS (Navy / Blue fintech theme)
- **Routing:** React Router v7
- **HTTP Client:** Axios (configured with `withCredentials: true` and automatic CSRF cookie interceptors)
- **Charts:** Recharts (responsive monthly cashflow and balance charts)
- **Icons:** Lucide React

### Backend
- **Framework:** Java 21 / Spring Boot 3.3.5
- **Security:** Spring Security 6 (Session fixation mitigation, CSRF Cookie repository, Security Headers)
- **Persistence:** Spring Data JPA / Hibernate (Parameterized queries, pessimistic write locks)
- **Validation:** Jakarta Bean Validation (DTO allowlists and regex patterns)
- **Database Migrations:** Flyway (Versioned SQL migrations)
- **Rate Limiting:** Bucket4j 8.10 (Per-IP and per-user token buckets)
- **2FA:** Dev.Samstevens TOTP + ZXing QR Code Engine
- **Encryption:** AES-256-GCM authenticated encryption with unique 96-bit nonces

### Database
- **Engine:** PostgreSQL 18 (Local instance running on `localhost:5432`)
- **Database Name:** `securebank_db`
- **Testing Profile:** H2 Database in PostgreSQL compatibility mode for isolated zero-dependency unit and security testing

---

## 3. Demonstration Accounts for Testing

Pre-seeded accounts are provided via Flyway migration `V2__seed_data.sql`:

| Role | Email Address | Password | Initial Balances & Purpose |
|---|---|---|---|
| **Administrator** | `admin@securebank.com` | `AdminPassword@123` | Full admin privileges: customer management, suspension, transaction monitoring, security events triage, audit log inspection. |
| **Customer A (Alice)** | `customera@securebank.com` | `CustomerA@123` | **Savings Account:** ₹10,000.00 (`SB-1001-SAVINGS`)<br>**Current Account:** ₹25,000.00 (`SB-1001-CURRENT`)<br>Has Bob saved as beneficiary. |
| **Customer B (Bob)** | `customerb@securebank.com` | `CustomerB@123` | **Savings Account:** ₹5,000.00 (`SB-1002-SAVINGS`)<br>Target recipient for transfer simulations. |

---

## 4. Quick Start (Local Execution)

### Prerequisites
- **Java:** JDK 21+ (or JDK 26)
- **Node.js:** v20+ or v24+
- **PostgreSQL:** Local PostgreSQL server running on port `5432`

### Step 1: Initialize Database
Run the setup script or create the database in PostgreSQL:
```powershell
# In PowerShell:
.\scripts\setup-db.ps1
```
*(Or via psql: `CREATE DATABASE securebank_db;`)*

### Step 2: Start Spring Boot Backend
```powershell
cd backend
mvn spring-boot:run
```
*Backend runs on `http://localhost:8080`. Flyway will automatically execute `V1__init_schema.sql` and `V2__seed_data.sql`.*

### Step 3: Start React Frontend
```powershell
cd frontend
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

### Step 4: Open Browser
Navigate to **`http://localhost:5173`** and sign in using one of the demonstration accounts!

---

## 5. Automated Test Suite

To run all 21 automated unit, integration, and security tests:
```powershell
cd backend
mvn test
```
All tests execute against an in-memory database with Spring Security and MockMvc, verifying:
- Authentication & password hashing
- Account lockout under brute force
- Atomic double-entry transfer balance integrity
- IDOR access denial
- AES-256-GCM encryption roundtrips
- TOTP secret generation & verification
- Security HTTP headers & CSRF protection

---

## 6. Project Documentation Index

- [LOCAL_SETUP.md](file:///e:/SecureBank/LOCAL_SETUP.md) — Detailed environment setup, troubleshooting, and commands.
- [ARCHITECTURE.md](file:///e:/SecureBank/ARCHITECTURE.md) — System architecture, layered design, and request lifecycle.
- [DATABASE_DESIGN.md](file:///e:/SecureBank/DATABASE_DESIGN.md) — Normalized relational schema, constraints, and ER diagram.
- [SECURITY_DESIGN.md](file:///e:/SecureBank/SECURITY_DESIGN.md) — Threat model, security controls, and defense-in-depth principles.
- [VULNERABILITY_REPORT.md](file:///e:/SecureBank/VULNERABILITY_REPORT.md) — Concrete attack demonstrations, test procedures, and mitigations.
- [API_DOCUMENTATION.md](file:///e:/SecureBank/API_DOCUMENTATION.md) — Complete REST API reference, request/response formats, and security rules.
- [TESTING_REPORT.md](file:///e:/SecureBank/TESTING_REPORT.md) — Automated testing matrix, code coverage, and test results.
- [PROGRESS.md](file:///e:/SecureBank/PROGRESS.md) — Phase-by-phase development log and verification checklist.
