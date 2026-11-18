# SecureBank — Security Architecture & Threat Model

---

## 1. Threat Model & STRIDE Analysis

| Threat Category | Banking Threat Scenario | SecureBank Mitigation |
|---|---|---|
| **Spoofing Identity** | Attacker impersonates Customer A by guessing passwords or replaying sessions. | BCrypt(12) hashing, mandatory TOTP 2FA, session ID regeneration upon login, generic authentication responses. |
| **Tampering with Data** | Attacker modifies transfer amount or destination account in transit. | Backend DTO validation, non-negative `BigDecimal` checks, pessimistic locking, double-entry ledger bookkeeping. |
| **Repudiation** | Customer denies having transferred money or changed their password. | Immutable `audit_logs` record actor, IP, timestamp, action, and transaction reference ID. |
| **Information Disclosure** | Attacker extracts other customer account balances or sees database error stack traces. | IDOR ownership verification, generic JSON exception messages, account number masking (`••••-••••-XXXX`). |
| **Denial of Service** | Attacker floods login or transfer endpoints with rapid requests. | Bucket4j token-bucket rate limiting per IP and per account, temporary 15-minute lockout after 5 failed attempts. |
| **Elevation of Privilege** | Normal customer accesses administrative endpoints to view all users or reactivate suspended accounts. | Spring Security Role-Based Access Control (`@PreAuthorize("hasRole('ADMIN')")`), distinct URL namespaces (`/api/admin/**`). |

---

## 2. Core Implemented Security Controls

### Control 1: SQL Injection Prevention (CWE-89)
- **Design:** Spring Data JPA with Hibernate ORM.
- **Enforcement:** All dynamic query criteria utilize parameterized PreparedStatement bindings (e.g. `WHERE b.accountNumber = :accountNumber`).
- **Policy:** Zero dynamic SQL string concatenation.
- **Verification:** Attack strings such as `' OR '1'='1` are treated purely as literal strings by PostgreSQL.

### Control 2: Cross-Site Scripting (XSS) Mitigation (CWE-79)
- **Frontend Layer:** React virtual DOM treats string props inside JSX as plain text, automatically encoding HTML entities before DOM insertion.
- **Backend Layer:** Jakarta Bean Validation reject illegal characters in names and usernames.
- **Transport Layer:** HTTP header `Content-Security-Policy: default-src 'self'; frame-ancestors 'none';` blocks untrusted script execution.

### Control 3: CSRF Double-Submit Cookie Pattern (CWE-352)
- **Mechanism:** Spring Security `CookieCsrfTokenRepository.withHttpOnlyFalse()` issues a cryptographically random token in the `XSRF-TOKEN` cookie.
- **Validation:** Every state-changing request (POST, PUT, DELETE) must provide the token in the `X-XSRF-TOKEN` HTTP header.
- **Cookie Policy:** `SameSite=Lax` ensures third-party websites cannot forge authenticated cross-origin requests.

### Control 4: Broken Access Control & IDOR Immunity (CWE-639)
- **Vulnerability Concept:** Insecure Direct Object Reference occurs when an application exposes a database key (e.g., `accountId=3`) and trusts the client without checking permissions.
- **Backend Enforcement:** The authenticated user is extracted securely from `SecurityContextHolder.getContext().getAuthentication()`. Every repository query or service method verifies:
  $$\text{account}.\text{getUser}().\text{getId}() == \text{currentUser}.\text{getId}()$$
- Any IDOR attempt throws `UnauthorizedAccessException` and immediately dispatches a `CRITICAL` severity event to `security_events`.

### Control 5: Brute-Force & Credential Stuffing Defense
- **Rate Limiting:** Bucket4j token buckets enforce maximum 5 login attempts per minute per IP and per email.
- **Lockout Mechanism:** After 5 consecutive failed attempts, `lockout_until` is set to $T_{\text{now}} + 15\text{ minutes}$.
- **Generic Errors:** Authentication failure returns `"Invalid email or password."` regardless of whether the email exists, preventing user enumeration.

### Control 6: Secure Session Management
- **Token Type:** High-entropy random servlet container session identifiers.
- **Cookie Flags:** `HttpOnly=true` (inaccessible to JavaScript), `Path=/`, `SameSite=Lax`.
- **Fixation Defense:** `migrateSession()` destroys pre-auth session and creates a fresh session upon authentication.
- **Revocation:** Active sessions are tracked in `user_sessions`; users can inspect device metadata and terminate other sessions remotely.

### Control 7: Password Security & Cryptographic Hygiene
- **Algorithm:** BCrypt with cost factor 12 (4096 rounds of Blowfish key expansion).
- **Complexity:** Enforces minimum 10 characters containing uppercase, lowercase, digit, and special character (`@$!%*?&`).
- **Reset Flow:** Single-use 256-bit random reset token; only SHA-256 hash stored in database; expires in 30 minutes; invalidates upon consumption.

### Control 8: Multi-Factor Authentication (TOTP)
- **Algorithm:** RFC 6238 Time-Based One-Time Password (SHA-1, 6 digits, 30-second time-step).
- **Secret Storage:** TOTP secret keys are encrypted at rest using AES-256-GCM.
- **Backup Codes:** Generates 8 single-use alphanumeric recovery codes (stored as BCrypt hashes).

### Control 9: Sensitive Data Encryption at Rest
- **Algorithm:** AES-256-GCM (Galois/Counter Mode) authenticated encryption.
- **Nonce Hygiene:** Fresh cryptographically secure 96-bit (12-byte) initialization vector generated per encryption call. Zero nonce reuse.
- **Key Storage:** Master key configured via environment variable `SECUREBANK_AES_SECRET_KEY` (never committed).

### Control 10: Security Headers
All responses from Spring Boot carry hardened HTTP response headers:
```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' http://localhost:5173 http://localhost:8080 http://127.0.0.1:5173; frame-ancestors 'none';
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Cache-Control: no-cache, no-store, max-age=0, must-revalidate
```

### Control 11: Financial Transaction Integrity
- **ACID Transactions:** `@Transactional(isolation = Isolation.READ_COMMITTED, rollbackFor = Exception.class)`.
- **Pessimistic Row Locking:** `@Lock(LockModeType.PESSIMISTIC_WRITE)` with deterministic ID ordering (`minId`, `maxId`) guarantees race-condition immunity and deadlock prevention.
- **Idempotency Keys:** Unique client transaction key prevents double submits.
- **Double-Entry Bookkeeping:** Generates exact debit and credit entries in `ledger_entries`.

---

## 3. Defense-in-Depth Summary

```mermaid
flowchart LR
    A[Client Request] --> B[WAF / Rate Limiter]
    B --> C[Security Headers & CSP]
    C --> D[CSRF Double-Submit Validation]
    D --> E[Session Authentication & MFA]
    E --> F[DTO Validation & Allowlists]
    F --> G[Service Ownership Check]
    G --> H[Pessimistic DB Locks]
    H --> I[Double-Entry Ledger Commit]
    I --> J[Forensic Audit Logging]
```
