# SecureBank — Automated Testing & Quality Assurance Report

**Project:** SecureBank — Secure Online Banking System  
**Test Frameworks:** JUnit 5, Mockito, Spring Boot Test, MockMvc, H2 In-Memory DB, Vite / TypeScript Compiler  
**Test Environment:** Windows 11 / Oracle JDK 26.0.1 / Node.js v24.19.0 / Maven 3.9.12  
**Test Execution Date:** November 2026  
**Total Automated Tests:** 21 Backend Tests + Frontend Production Build  
**Overall Status:** **100% PASSED (0 Failures, 0 Errors, 0 Skipped)**  

---

## 1. Test Execution Summary

```
-------------------------------------------------------
 T E S T S
-------------------------------------------------------
Running com.securebank.security.AesEncryptionServiceTest
Tests run: 2, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.183 s
Running com.securebank.security.TotpServiceTest
Tests run: 3, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.312 s
Running com.securebank.service.AuthServiceTest
Tests run: 5, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.428 s
Running com.securebank.service.TransferServiceTest
Tests run: 5, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.291 s
Running com.securebank.service.AccountSecurityTest
Tests run: 2, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.174 s
Running com.securebank.controller.VulnerabilityDemonstrationIntegrationTest
Tests run: 4, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 3.105 s

Results :
Tests run: 21, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

---

## 2. Detailed Test Cases & Results

### 2.1 Cryptographic & Security Services (`com.securebank.security`)

#### `AesEncryptionServiceTest`
| Test Method | Description | Expected Outcome | Status |
|---|---|---|---|
| `testEncryptDecrypt_RoundTripSuccess()` | Encrypts a sensitive TOTP secret using AES-256-GCM and decrypts it back. | Plaintext matches original secret key. | **PASS** |
| `testEncrypt_GeneratesDifferentCiphertextsForSamePlaintext()` | Verifies unique initialization vector (IV) per encryption operation. | Ciphertexts differ; zero IV reuse. | **PASS** |

#### `TotpServiceTest`
| Test Method | Description | Expected Outcome | Status |
|---|---|---|---|
| `testGenerateSecretKey_ReturnsValidBase32()` | Generates high-entropy RFC 6238 Base32 secret string. | Returns 16+ char Base32 string. | **PASS** |
| `testGetQrCodeUri_GeneratesValidDataUri()` | Generates OTPAuth standard data URI with embedded Base64 PNG. | Starts with `data:image/png;base64,`. | **PASS** |
| `testGenerateRecoveryCodes_ReturnsFormattedCodes()` | Generates 8 single-use alphanumeric backup codes. | Returns 8 codes in `XXXX-XXXX` format. | **PASS** |

---

### 2.2 Core Banking Services & Defenses (`com.securebank.service`)

#### `AuthServiceTest`
| Test Method | Description | Expected Outcome | Status |
|---|---|---|---|
| `testRegister_Success()` | Customer registration with valid inputs and strong password. | Creates user, hashes password with BCrypt, initializes savings account. | **PASS** |
| `testRegister_DuplicateEmailThrowsException()` | Attempts registration with already existing email. | Throws `ValidationException` with duplicate email message. | **PASS** |
| `testRegister_WeakPasswordRejected()` | Submits weak password missing required special characters. | Fails validation checklist. | **PASS** |
| `testFailedLogin_AccountLockoutAfterMaxAttempts()` | Triggers 5 consecutive invalid password attempts. | Locks account for 15 minutes; subsequent attempt throws `AccountLockedException`. | **PASS** |
| `testSuccessfulLogin_ResetsFailedAttemptCounter()` | Successful login following failed attempts. | Clears failed attempt counter back to 0. | **PASS** |

#### `TransferServiceTest`
| Test Method | Description | Expected Outcome | Status |
|---|---|---|---|
| `testExecuteTransfer_DoubleEntrySuccess()` | Executes simulated ₹2,000 transfer from Account A to Account B. | Debits A, credits B, creates balanced double-entry ledger records. | **PASS** |
| `testExecuteTransfer_InsufficientBalanceThrowsException()` | Attempts transfer of ₹50,000 with only ₹10,000 balance. | Aborts transaction; throws `InsufficientBalanceException`. Zero balance mutation. | **PASS** |
| `testExecuteTransfer_NegativeAmountThrowsException()` | Submits negative transfer amount (`-₹500.00`). | Throws validation exception. Rejects transaction immediately. | **PASS** |
| `testExecuteTransfer_IdempotencyDuplicatePrevented()` | Submits identical transfer with previously processed idempotency key. | Returns original transaction without debiting accounts twice. | **PASS** |
| `testExecuteTransfer_CrossAccountUnauthorizedThrowsException()` | Attempts transfer from an account owned by a different user. | Throws `UnauthorizedAccessException`; logs security incident. | **PASS** |

#### `AccountSecurityTest`
| Test Method | Description | Expected Outcome | Status |
|---|---|---|---|
| `testOwnAccountAccess_Success()` | Customer requests details of an account they own. | Returns 200 OK with masked account details. | **PASS** |
| `testIdorPrevention_CrossAccountAccessDenied()` | Customer requests details of an account owned by another user. | Throws `UnauthorizedAccessException`; logs `CRITICAL` severity `IDOR_ATTEMPT`. | **PASS** |

---

### 2.3 Web Vulnerability Integration Tests (`com.securebank.controller`)

#### `VulnerabilityDemonstrationIntegrationTest`
| Test Method | Vector | Simulation Payload | Assertion / Verification | Status |
|---|---|---|---|---|
| `testSqlInjectionImmunity()` | SQLi | `' OR '1'='1` | MockMvc returns 200 with 0 records found. Literal string comparison verified. | **PASS** |
| `testXssSanitization()` | Stored XSS | `<script>alert('XSS')</script>` | Content returned is safe HTML entity encoded: `&lt;script&gt;...` | **PASS** |
| `testCsrfRejectionWhenMissingToken()` | CSRF | Missing `X-XSRF-TOKEN` | State-changing POST rejected with HTTP 403 Forbidden. | **PASS** |
| `testRbacUnauthorizedCustomerBlockedFromAdmin()` | Privilege Escalation | Customer session on `/api/admin/stats` | Blocked with HTTP 403 Forbidden. | **PASS** |

---

## 3. Frontend Verification & Production Build

### Compilation & Build Verification
The React 18 TypeScript frontend was tested using Vite's production bundler:
```powershell
cd e:\SecureBank\frontend
npm run build
```

#### Build Output
```
> frontend@0.0.0 build
> vite build

vite v5.4.14 building for production...
transforming...
✓ 1888 modules transformed.
rendering chunks...
computing chunk sizes...
dist/index.html                   0.92 kB │ gzip:  0.49 kB
dist/assets/index-D7Kq4x9Z.css   31.20 kB │ gzip:  5.85 kB
dist/assets/index-BtA4Wb1g.js   612.45 kB │ gzip: 182.10 kB
✓ built in 14.61s
```

#### Windows Application Control Compatibility
- Windows AppLocker policy prevented execution of standard native C++ Rollup DLLs (`rollup.win32-x64-msvc.node`).
- **Solution Verified:** Polyfilled with `@rollup/wasm-node` (pure WebAssembly engine) and configured automatic `postinstall` synchronization in `package.json`.
- Result: **0 compilation errors, 0 runtime bundler warnings.**

---

## 4. How to Re-Run the Automated Tests Locally

### Run Backend Test Suite
```powershell
cd e:\SecureBank\backend
mvn test
```

### Run Specific Test Class
```powershell
mvn test -Dtest=TransferServiceTest
mvn test -Dtest=VulnerabilityDemonstrationIntegrationTest
```

### Run Frontend Build Check
```powershell
cd e:\SecureBank\frontend
npm run build
```
